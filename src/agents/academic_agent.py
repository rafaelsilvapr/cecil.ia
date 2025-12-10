import logging
import os
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)

class AcademicAgent:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def analyze(self, extracted_data: dict) -> dict:
        """
        Analyzes the extracted PDF data to produce an academic report.
        
        Args:
            extracted_data (dict): The JSON output from the PDF ingestion step.
            
        Returns:
            dict: The academic_report JSON.
        """
        logger.info("Starting Academic Analysis with Gemini...")
        
        full_text = extracted_data.get("full_text", "")
        # Gemini 1.5 Flash has a huge context window, so we can likely pass the whole text
        # But let's keep a reasonable limit just in case of extremely large files
        truncated_text = full_text[:100000] 

        prompt = f"""
        You are an expert academic researcher. Analyze the following research article text and produce a detailed 'academic_report' in JSON format.
        
        Input Text:
        {truncated_text}
        
        Your output JSON must have the following keys (values in **Portuguese (Brazil)**):
        - "summary": A concise summary of the paper.
        - "key_findings": List of main results or arguments.
        - "methodology_details": {{
            "sample_size": "Number of participants (e.g., 50 students)",
            "duration": "Length of study (e.g., 12 weeks)",
            "groups": "Description of control vs experimental groups",
            "procedure": "Brief step-by-step of what happened"
        }}
        - "deeper_interpretation": A deep dive into the implications, going beyond the surface text.
        - "limitations_and_debates": Potential weaknesses, missing angles, or areas of disagreement in the field.
        - "contextual_relevance": How this fits into the broader history and future of this discipline.
        - "controversies": Any inferred controversies or unresolved questions.
        - "related_trajectories": Where this research might lead next.
        
        Ensure the tone is objective, scholarly, and insightful.
        Output ONLY valid JSON.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            report = json.loads(response.text)
            logger.info("Academic Analysis complete.")
            return report

        except Exception as e:
            logger.error(f"Error in AcademicAgent: {e}")
            return {"error": str(e)}
