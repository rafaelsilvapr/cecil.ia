import logging
import os
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)

class ScriptAgent:
    def __init__(self):
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.model = genai.GenerativeModel('gemini-flash-latest')

    async def generate_script(self, knowledge_base: dict) -> str:
        """
        Generates a video script based on the unified knowledge base.
        
        Args:
            knowledge_base (dict): The output from SynthesisAgent.
            
        Returns:
            str: The generated script text.
        """
        logger.info("Generating Script v1 with Gemini...")
        
        prompt = f"""
        Write a 60-second vertical video script based on this knowledge base.
        
        Knowledge Base:
        {json.dumps(knowledge_base, indent=2)}
        
        Format requirements:
        - **LANGUAGE: PORTUGUESE (BRAZIL) ONLY**. DO NOT WRITE IN ENGLISH.
        - Vertical video pacing (fast, engaging).
        - Total word count: 130-160 words (for ~60s speed).
        - **Structure**: Break the script into small segments of approximately 5 seconds each.
        - **Visuals**: Every segment MUST have a visual cue.
        - **Infographics**: Explicitly request infographic visuals for methodology sections.
        
        Example Output Format:
        **Tempo:** 0-5s
        **Visual:** Professor estressado com pilhas de papel
        **Texto:** Você já se sentiu afogado em correções?
        
        **Tempo:** 5-10s
        **Visual:** Infográfico simples: Ícone de relógio marcando 12 semanas
        **Texto:** Um novo estudo de 12 semanas mudou tudo isso.
        
        ... (continue for full 60s)
        
        The narration text should be clear, conversational, and natural for a Brazilian speaker.
        **CRITICAL: OUTPUT MUST BE IN PORTUGUESE (BRAZIL). USE BOLD LABELS AS SHOWN.**
        Output ONLY the script text, ready for review.
        """

        try:
            response = self.model.generate_content(prompt)
            script = response.text
            logger.info("Script generation complete.")
            return script

        except Exception as e:
            logger.error(f"Error in ScriptAgent: {e}")
            return f"Error generating script: {str(e)}"

    async def revise_script(self, current_script: str, user_feedback: str) -> str:
        """
        Revises the script based on user feedback.
        """
        logger.info("Revising Script with Gemini...")
        
        prompt = f"""
        Revise the following script based on the user's feedback.
        
        Current Script:
        {current_script}
        
        User Feedback:
        "{user_feedback}"
        
        **Language: Portuguese (Brazil)**.
        Keep the same format (Scene headers, visual cues).
        Output ONLY the revised script.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Error revising script: {e}")
            return f"Error revising script: {str(e)}"
