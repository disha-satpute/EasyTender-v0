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

    if total_images > 0 and total_text_blocks < page_count:
        processing_type = "OCR"
    elif total_images > 0 and total_text_blocks >= page_count:
        processing_type = "MIXED"
    else:
        processing_type = "DIGITAL_TEXT"

    return {
        "pageCount": page_count,
        "processingType": processing_type,
        "totalTextBlocks": total_text_blocks,
        "totalImages": total_images,
        "fileKey": fileKey
    }

from pydantic import BaseModel
from typing import List, Optional
import sys

class SearchRequest(BaseModel):
    fileKey: str
    searchText: str

class ReplaceRequest(BaseModel):
    fileKey: str
    findText: str
    replaceText: str
    matchIndex: Optional[int] = None # None means replace all

class AddTextRequest(BaseModel):
    fileKey: str
    text: str
    x: float
    y: float
    page: int

def hex_to_rgb(hex_color):
    if isinstance(hex_color, int):
        r = ((hex_color >> 16) & 255) / 255.0
        g = ((hex_color >> 8) & 255) / 255.0
        b = (hex_color & 255) / 255.0
        return (r, g, b)
    return (0, 0, 0)

def get_base_font(font_name):
    # Default to a standard font. In production with Marathi, we'd load Noto Sans Devanagari.
    return "helv"

def search_digital_page(page, search_text):
    """Robust case-insensitive search for digital text."""
    matches = []
    search_words = search_text.lower().split()
    if not search_words:
        return matches
        
    words = page.get_text("words")  # [x0, y0, x1, y1, word, block_no, line_no, word_no]
    num_words = len(words)
    
    for i in range(num_words - len(search_words) + 1):
        match = True
        for j in range(len(search_words)):
            doc_word = ''.join(e for e in words[i+j][4].lower() if e.isalnum())
            target_word = ''.join(e for e in search_words[j] if e.isalnum())
            if doc_word != target_word:
                match = False
                break
                
        if match:
            x0 = min(words[i+j][0] for j in range(len(search_words)))
            y0 = min(words[i+j][1] for j in range(len(search_words)))
            x1 = max(words[i+j][2] for j in range(len(search_words)))
            y1 = max(words[i+j][3] for j in range(len(search_words)))
            matches.append(fitz.Rect(x0, y0, x1, y1))
            
    return matches

def search_ocr_page(page, search_text, dpi=150):
    """Helper function to perform OCR on a page and find search text."""
    pix = page.get_pixmap(dpi=dpi)
    img = Image.open(io.BytesIO(pix.tobytes("png")))
    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
    
    matches = []
    search_words = search_text.lower().split()
    if not search_words:
        return matches
        
    num_words = len(data['text'])
    scale_x = page.rect.width / pix.width
    scale_y = page.rect.height / pix.height
    
    for i in range(num_words - len(search_words) + 1):
        # Check if consecutive words match
        match = True
        for j in range(len(search_words)):
            ocr_word = str(data['text'][i+j]).strip().lower()
            # Basic text normalization (remove punctuation)
            ocr_word = ''.join(e for e in ocr_word if e.isalnum())
            target_word = ''.join(e for e in search_words[j] if e.isalnum())
            if ocr_word != target_word:
                match = False
                break
                
        if match:
            # Combine bounding boxes of the matched words
            x0 = min(data['left'][i+j] for j in range(len(search_words)))
            y0 = min(data['top'][i+j] for j in range(len(search_words)))
            x1 = max(data['left'][i+j] + data['width'][i+j] for j in range(len(search_words)))
            y1 = max(data['top'][i+j] + data['height'][i+j] for j in range(len(search_words)))
            
            # Map back to PDF coordinates
            matches.append(fitz.Rect(
                x0 * scale_x,
                y0 * scale_y,
                x1 * scale_x,
                y1 * scale_y
            ))
            
    return matches

@app.post("/search")
async def search_pdf(req: SearchRequest):
    file_path = os.path.join(UPLOAD_DIR, req.fileKey)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF: {str(e)}")

    matches = []
    
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        
        # Robust digital search
        rects = search_digital_page(page, req.searchText)
        
        # Always run OCR search to catch scanned portions
        ocr_rects = search_ocr_page(page, req.searchText)
        
        # Combine and deduplicate
        for ocr_r in ocr_rects:
            is_dup = False
            for r in rects:
                if abs(r.x0 - ocr_r.x0) < 15 and abs(r.y0 - ocr_r.y0) < 15:
                    is_dup = True
                    break
            if not is_dup:
                rects.append(ocr_r)
        
        if rects:
            for rect in rects:
                matches.append({
                    "page": page_num + 1,
                    "text": req.searchText,
                    "rect": [rect.x0, rect.y0, rect.x1, rect.y1]
                })
    doc.close()
    return {"matches": matches, "total": len(matches)}

@app.post("/replace")
async def replace_pdf(req: ReplaceRequest):
    file_path = os.path.join(UPLOAD_DIR, req.fileKey)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF: {str(e)}")

    total_replaced = 0
    match_counter = 1

    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        
        # Robust digital search
        rects = search_digital_page(page, req.findText)
        
        # Always run OCR search to catch scanned portions
        ocr_rects = search_ocr_page(page, req.findText)
        
        # Combine and deduplicate
        for ocr_r in ocr_rects:
            is_dup = False
            for r in rects:
                if abs(r.x0 - ocr_r.x0) < 15 and abs(r.y0 - ocr_r.y0) < 15:
                    is_dup = True
                    break
            if not is_dup:
                rects.append(ocr_r)
            
        if not rects:
            continue
            
        for rect in rects:
            if req.matchIndex is not None and match_counter != req.matchIndex:
                match_counter += 1
                continue
                
            font_name = "helv"
            font_size = 11.0
            font_color = (0, 0, 0)
            
            # Draw a white rectangle to obscure the old text/image part (works better for OCR'd images)
            page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1), overlay=True)
            
            # Step 2: Insert replacement
            point = fitz.Point(rect.x0, rect.y1 - (font_size * 0.2))
            page.insert_text(
                point,
                req.replaceText,
                fontsize=font_size,
                fontname=font_name,
                color=font_color
            )
            
            total_replaced += 1
            match_counter += 1

    if total_replaced > 0:
        new_filename = f"mod_{os.path.basename(req.fileKey)}"
        new_path = os.path.join(UPLOAD_DIR, new_filename)
        doc.save(new_path)
        doc.close()
        return {"success": True, "replaced": total_replaced, "newFileKey": new_filename}
    
    doc.close()
    return {"success": False, "replaced": 0, "newFileKey": req.fileKey}

@app.post("/add-text")
async def add_text_pdf(req: AddTextRequest):
    file_path = os.path.join(UPLOAD_DIR, req.fileKey)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        doc = fitz.open(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid PDF: {str(e)}")

    page_num = req.page - 1
    if page_num < 0 or page_num >= doc.page_count:
        doc.close()
        raise HTTPException(status_code=400, detail="Invalid page number")

    page = doc.load_page(page_num)
    
    font_name = "helv"
    font_size = 11.0
    font_color = (0, 0, 0)
    
    point = fitz.Point(req.x, req.y)
    page.insert_text(
        point,
        req.text,
        fontsize=font_size,
        fontname=font_name,
        color=font_color
    )
    
    new_filename = f"add_{os.path.basename(req.fileKey)}"
    new_path = os.path.join(UPLOAD_DIR, new_filename)
    doc.save(new_path)
    doc.close()
    
    return {"success": True, "newFileKey": new_filename}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
