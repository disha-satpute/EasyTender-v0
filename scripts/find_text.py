import fitz
import sys
import json

def find_text_in_pdf(pdf_path, search_text):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return

    matches = []
    
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        
        # We can use search_for to get bounding boxes directly
        rects = page.search_for(search_text)
        
        if rects:
            # To get font info, we need to extract dict and match coordinates
            text_dict = page.get_text("dict")
            
            for rect in rects:
                font_name = "Unknown"
                font_size = 0.0
                font_color = 0
                
                # Heuristic to find the font of the text inside the rect
                for block in text_dict.get("blocks", []):
                    if block.get("type") == 0:
                        for line in block.get("lines", []):
                            for span in line.get("spans", []):
                                # If span bounding box intersects heavily with search rect
                                s_rect = fitz.Rect(span["bbox"])
                                if s_rect.intersects(rect):
                                    font_name = span["font"]
                                    font_size = span["size"]
                                    font_color = span["color"]
                                    break
                
                matches.append({
                    "page": page_num + 1,
                    "text": search_text,
                    "rect": (rect.x0, rect.y0, rect.x1, rect.y1),
                    "font": font_name,
                    "size": round(font_size, 2),
                    "color": font_color
                })

    for i, match in enumerate(matches):
        print(f"\nMatch {i + 1}")
        print(f"Page: {match['page']}")
        print(f"Text: {match['text']}")
        print(f"Rect: {match['rect']}")
        print(f"Font: {match['font']}")
        print(f"Size: {match['size']}")
        # Convert integer color to hex
        color_hex = f"#{match['color']:06x}" if isinstance(match['color'], int) else match['color']
        print(f"Color: {color_hex}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python find_text.py <pdf_path> <search_text>")
        sys.exit(1)
        
    pdf_file = sys.argv[1]
    search_term = sys.argv[2]
    find_text_in_pdf(pdf_file, search_term)
