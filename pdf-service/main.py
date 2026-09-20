import os
from fastapi import FastAPI, UploadFile, File, HTTPException
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import json

# Set explicit path for Windows to avoid environment variable issues
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = FastAPI(title="EasyTender PDF Service")

# Base directory for uploads (shared with Node.js in dev)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '../uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "PDF Service is running"}

@app.post("/analyze")
async def analyze_pdf(fileKey: str):
    """
    Analyzes a PDF to extract text and determine if OCR is needed.
    """
    file_path = os.path.join(UPLOAD_DIR, fileKey)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF: {str(e)}")

    page_count = doc.page_count
    
    # Simple heuristic to check if it's a scanned PDF
    total_text_blocks = 0
    total_images = 0
    
    for page_num in range(page_count):
        page = doc.load_page(page_num)
        text_blocks = [b for b in page.get_text("dict").get("blocks", []) if b.get("type") == 0]
        total_text_blocks += len(text_blocks)
        total_images += len(page.get_images(full=True))
        
    doc.close()

    processing_type = "DIGITAL_TEXT"
    if total_images > 0 and total_text_blocks < page_count:
        processing_type = "OCR"
    elif total_images > 0 and total_text_blocks >= page_count:
        processing_type = "MIXED"

    return {
        "pageCount": page_count,
        "processingType": processing_type,
        "totalTextBlocks": total_text_blocks,
        "totalImages": total_images,
        "fileKey": fileKey
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
