import fitz  # PyMuPDF
import sys

def analyze_pdf(pdf_path, search_text="ABC Construction"):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return

    print(f"--- PDF ANALYSIS: {pdf_path} ---")
    print(f"Total Pages: {doc.page_count}")
    print(f"Is PDF: {doc.is_pdf}")
    
    total_blocks = 0
    total_spans = 0
    found_matches = 0

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        print(f"\nPAGE {page_num + 1}")
        print(f"------")
        print(f"Page size: {page.rect.width} x {page.rect.height}")
        
        text_dict = page.get_text("dict")
        blocks = text_dict.get("blocks", [])
        
        page_blocks = 0
        page_spans = 0
        
        for block in blocks:
            if block.get("type") == 0:  # Text block
                page_blocks += 1
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        page_spans += 1
                        
                        if search_text in span.get("text", ""):
                            found_matches += 1
                            print("\nMatching text span:")
                            print(f"Text: '{span['text']}'")
                            print(f"Bounding box: x0={span['bbox'][0]:.2f}, y0={span['bbox'][1]:.2f}, x1={span['bbox'][2]:.2f}, y1={span['bbox'][3]:.2f}")
                            print(f"Font: {span['font']}")
                            print(f"Font size: {span['size']:.2f}")
                            print(f"Color: {span['color']}")
        
        print(f"Text blocks: {page_blocks}")
        print(f"Text spans: {page_spans}")
        total_blocks += page_blocks
        total_spans += page_spans
        
        # Check if page is image-heavy (scanned)
        image_list = page.get_images(full=True)
        if len(image_list) > 0 and page_blocks < 2:
            print(f"Warning: Page {page_num + 1} appears to be a scanned image (has images but very little text).")

    print(f"\n--- SUMMARY ---")
    print(f"Total Blocks: {total_blocks}")
    print(f"Total Spans: {total_spans}")
    print(f"Total Matches for '{search_text}': {found_matches}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_pdf.py <pdf_path> [search_text]")
        sys.exit(1)
        
    pdf_file = sys.argv[1]
    search_term = sys.argv[2] if len(sys.argv) > 2 else "ABC Construction"
    analyze_pdf(pdf_file, search_term)
