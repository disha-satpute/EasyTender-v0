from fpdf import FPDF
import os

def create_sample_pdf(output_path):
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "CONTRACTOR DECLARATION", 0, 1, 'C')
    pdf.ln(10)
    
    # Body
    pdf.set_font("Arial", '', 12)
    
    body_text1 = "I, ABC Construction, hereby declare that the information provided by ABC Construction in this document is true and correct to the best of my knowledge."
    pdf.multi_cell(0, 8, body_text1)
    pdf.ln(5)
    
    body_text2 = "This is to certify that ABC Construction has not been blacklisted by any Government department."
    pdf.multi_cell(0, 8, body_text2)
    pdf.ln(10)
    
    body_text3 = "For ABC Construction"
    pdf.multi_cell(0, 8, body_text3)
    pdf.ln(20)
    
    # Signatures
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 8, "Authorized Signatory", 0, 1)
    pdf.set_font("Arial", '', 12)
    pdf.cell(0, 8, "Date: 01/01/2025", 0, 1)
    pdf.cell(0, 8, "Place: Pune", 0, 1)
    
    # Second Page
    pdf.add_page()
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(0, 10, "ANNEXURE A", 0, 1, 'C')
    pdf.ln(10)
    
    pdf.set_font("Arial", '', 12)
    annexure_text = "The vendor ABC Construction shall complete the project by the year 2025. This document is binding on ABC Construction."
    pdf.multi_cell(0, 8, annexure_text)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    pdf.output(output_path)
    print(f"Sample PDF created at: {output_path}")

if __name__ == "__main__":
    create_sample_pdf("input/original.pdf")
