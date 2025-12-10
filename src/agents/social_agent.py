import logging
import os
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)

class SocialAgent:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def analyze(self, extracted_data: dict) -> dict:
        """
        Analyzes the extracted PDF data to produce a social media content report.
        
        Args:
            extracted_data (dict): The JSON output from the PDF ingestion step.
            
        Returns:
            dict: The social_report JSON.
        """
        logger.info("Starting Social Analysis with Gemini...")
        
        full_text = extracted_data.get("full_text", "")
        truncated_text = full_text[:100000]

        prompt = f"""
        You are an expert social media strategist and content creator for platforms like TikTok, Instagram Reels, and YouTube Shorts, specifically for the **Brazilian market**.
        Analyze the following research article text and produce a 'social_report' in JSON format.
        
        Input Text:
        {truncated_text}
        
        Your output JSON must have the following keys (values must be in **Portuguese (Brazil)**):
        - "target_audience_pain_points": What frustrations or desires does this topic address for a general or teacher audience in Brazil?
        - "viral_hooks": List of 3-5 strong opening lines (in Portuguese) that would grab attention immediately. Use Brazilian internet slang/style if appropriate but keep it respectful.
        - "narrative_patterns": Suggested storytelling structures (e.g., "O Mistério," "O Mito Detonado," "O Passo a Passo").
        - "visual_style_suggestions": Ideas for visuals that would work well (e.g., "tipografia rápida," "cenas de natureza," "animações de diagramas").
        - "engagement_strategies": How to encourage comments or shares (e.g., "Pergunte se concordam," "Desafie uma crença comum").
        - "trending_formats": Inferred video formats that match this content (e.g., "Tela verde comentada," "Lista," "Storytime").
        
        Focus on "Edutainment" - making it educational but highly entertaining and digestible for Brazilians.
        Output ONLY valid JSON.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            report = json.loads(response.text)
            logger.info("Social Analysis complete.")
            return report

        except Exception as e:
            logger.error(f"Error in SocialAgent: {e}")
            return {"error": str(e)}
