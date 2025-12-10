import logging
import json
from pypdf import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_path: str) -> dict:
    """
    Extracts text and basic metadata from a PDF file.
    
    Args:
        pdf_path (str): Path to the PDF file.
        
    Returns:
        dict: A dictionary containing extracted text and metadata.
    """
    try:
        reader = PdfReader(pdf_path)
        text_content = ""
        
        # Extract text from each page
        for page in reader.pages:
            text_content += page.extract_text() + "\n"
            
        # Basic metadata extraction
        metadata = reader.metadata
        title = metadata.title if metadata and metadata.title else "Unknown Title"
        
        # Simple structure parsing (naive approach for now)
        # In a real scenario, we might use more advanced parsing to identify sections
        
        result = {
            "title": title,
            "full_text": text_content,
            "page_count": len(reader.pages),
            "metadata": {k: str(v) for k, v in metadata.items()} if metadata else {}
        }
        
        return result

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise
