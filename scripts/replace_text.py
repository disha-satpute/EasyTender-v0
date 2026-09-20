import fitz
import sys
import argparse
import os

def hex_to_rgb(hex_color):
    """Convert hex color or int color to RGB tuple (0-1 range for fitz)."""
    if isinstance(hex_color, int):
        r = ((hex_color >> 16) & 255) / 255.0
        g = ((hex_color >> 8) & 255) / 255.0
        b = (hex_color & 255) / 255.0
        return (r, g, b)
    return (0, 0, 0)

def get_base_font(font_name):
    """Map extracted font names to standard PDF base fonts."""
    lower_font = font_name.lower()
    if 'bold' in lower_font:
        if 'times' in lower_font: return "times-bold"
        if 'courier' in lower_font: return "courier-bold"
        return "helv-bold"  # Default bold
    if 'italic' in lower_font:
        if 'times' in lower_font: return "times-italic"
        if 'courier' in lower_font: return "courier-oblique"
        return "helv-oblique"
    
    if 'times' in lower_font: return "times-roman"
    if 'courier' in lower_font: return "courier"
    return "helv"  # Default to Helvetica

def replace_text_in_pdf(input_path, output_path, find_text, replace_text, match_index=None):
    try:
        doc = fitz.open(input_path)
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return

    total_replaced = 0
    match_counter = 1

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        
        # Find instances of the text
        rects = page.search_for(find_text)
        if not rects:
            continue
            
        text_dict = page.get_text("dict")
        
        for rect in rects:
            # If match_index is specified, only replace that one occurrence (1-indexed)
            if match_index is not None and match_counter != match_index:
                match_counter += 1
                continue
                
            font_name = "helv"
            font_size = 11.0
            font_color = (0, 0, 0)
            
            # Heuristic to find original font
            for block in text_dict.get("blocks", []):
                if block.get("type") == 0:
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            s_rect = fitz.Rect(span["bbox"])
                            if s_rect.intersects(rect):
                                font_name = get_base_font(span["font"])
                                font_size = span["size"]
                                font_color = hex_to_rgb(span["color"])
                                break

            # Step 1: Add Redaction annotation to "erase" original text
            annot = page.add_redact_annot(rect, text="")
            page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
            
            # Step 2: Insert replacement text
            # We insert it slightly above the bottom left of the rect to align baselines
            point = fitz.Point(rect.x0, rect.y1 - (font_size * 0.2))
            page.insert_text(
                point,
                replace_text,
                fontsize=font_size,
                fontname=font_name,
                color=font_color
            )
            
            print(f"Replaced occurrence {match_counter} on page {page_num + 1}")
            total_replaced += 1
            match_counter += 1

    if total_replaced > 0:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc.save(output_path)
        print(f"\nSuccessfully replaced {total_replaced} occurrences.")
        print(f"Saved modified PDF to: {output_path}")
    else:
        print("\nNo occurrences were replaced.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Find and Replace text in PDF")
    parser.add_argument("--input", required=True, help="Input PDF path")
    parser.add_argument("--output", required=True, help="Output PDF path")
    parser.add_argument("--find", required=True, help="Text to find")
    parser.add_argument("--replace", required=True, help="Text to replace with")
    parser.add_argument("--match-index", type=int, help="Specific match occurrence to replace (1-indexed)")
    
    args = parser.parse_args()
    
    replace_text_in_pdf(args.input, args.output, args.find, args.replace, args.match_index)
