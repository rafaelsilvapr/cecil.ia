import logging
import os
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)

class SynthesisAgent:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def synthesize(self, academic_report: dict, social_report: dict) -> dict:
        """
        Merges the academic and social reports into a unified knowledge base.
        
        Args:
            academic_report (dict): The output from AcademicAgent.
            social_report (dict): The output from SocialAgent.
            
        Returns:
            dict: The unified_knowledge_base JSON.
        """
        logger.info("Starting Synthesis with Gemini...")
        
        prompt = f"""
        You are a Creative Director for an educational media channel in **Brazil**.
        Merge the following two reports into a 'unified_knowledge_base' for a video script.
        
        Academic Report:
        {json.dumps(academic_report, indent=2)}
        
        Social Report:
        {json.dumps(social_report, indent=2)}
        
        Your goal is to find the sweet spot where deep academic insight meets high social engagement for a **Brazilian audience**.
        
        Output JSON must have (values in **PORTUGUESE (BRAZIL)**):
        - "core_message": The single most important takeaway (1 sentence).
        - "hook_strategy": The chosen hook from the social report, refined with academic credibility.
        - "key_insights_for_script": 3-4 bullet points that MUST be in the script.
        - "tone_guide": Adjectives describing the voice (e.g., "Urgente mas esperançoso," "Sarcástico mas inteligente").
        - "visual_direction": General look and feel.
        - "script_outline": A rough scene-by-scene breakdown (Hook -> Problem -> Insight -> Solution -> Call to Action).
        
        **CRITICAL: ALL TEXT VALUES IN THE JSON MUST BE IN PORTUGUESE (BRAZIL).**
        Output ONLY valid JSON.
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
            knowledge_base = json.loads(response.text)
            logger.info("Synthesis complete.")
            return knowledge_base

        except Exception as e:
            logger.error(f"Error in SynthesisAgent: {e}")
            return {"error": str(e)}
