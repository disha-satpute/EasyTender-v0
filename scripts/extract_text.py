import fitz
import sys
import os

def extract_text(pdf_path, output_path, search_text="ABC Construction"):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    total_matches = 0
    
    with open(output_path, 'w', encoding='utf-8') as f:
        for page_num in range(doc.page_count):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            
            f.write(f"--- PAGE {page_num + 1} ---\n")
            f.write(text)
            f.write("\n\n")
            
            # Simple text count in the raw extracted text
            matches_on_page = text.count(search_text)
            total_matches += matches_on_page
            
    print(f"Text successfully extracted to {output_path}")
    
    if total_matches > 0:
        print(f"Found {total_matches} occurrences of '{search_text}'.")
    else:
        print("No exact match found.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_text.py <pdf_path> [search_text]")
        sys.exit(1)
        
    pdf_file = sys.argv[1]
    search_term = sys.argv[2] if len(sys.argv) > 2 else "ABC Construction"
    output_file = "output/extracted_text.txt"
    
    extract_text(pdf_file, output_file, search_term)
