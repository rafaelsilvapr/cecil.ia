import logging
import os
from openai import OpenAI

logger = logging.getLogger(__name__)

class AudioGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "tts-1"
        self.voice = "alloy" # Options: alloy, echo, fable, onyx, nova, shimmer

    async def generate_narration(self, text: str, output_path: str) -> str:
        """
        Generates audio from text using OpenAI TTS.
        
        Args:
            text (str): The text to narrate.
            output_path (str): The path to save the audio file.
            
        Returns:
            str: The path to the generated audio file.
        """
        logger.info("Generating AI Narration...")
        
        try:
            response = self.client.audio.speech.create(
                model=self.model,
                voice=self.voice,
                input=text
            )
            
            response.stream_to_file(output_path)
            logger.info(f"Audio saved to {output_path}")
            return output_path

        except Exception as e:
            logger.error(f"Error generating audio: {e}")
            raise
