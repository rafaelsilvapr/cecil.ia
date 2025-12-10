import logging
import os
from openai import OpenAI

logger = logging.getLogger(__name__)

class TranscriptionService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "whisper-1"

    async def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribes audio file to text using OpenAI Whisper.
        
        Args:
            audio_path (str): Path to the audio file.
            
        Returns:
            str: Transcribed text.
        """
        logger.info(f"Transcribing audio: {audio_path}")
        try:
            with open(audio_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language="pt" # Force Portuguese detection/transcription
                )
            
            text = transcription.text
            logger.info(f"Transcription complete: {text[:50]}...")
            return text
            
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise

    async def transcribe_for_subtitles(self, audio_path: str) -> list:
        """
        Transcribes audio and returns word-level timestamps for subtitles.
        
        Args:
            audio_path (str): Path to audio file.
            
        Returns:
            list: List of dicts [{'word': str, 'start': float, 'end': float}, ...]
        """
        logger.info(f"Transcribing for subtitles: {audio_path}")
        try:
            with open(audio_path, "rb") as audio_file:
                transcription = self.client.audio.transcriptions.create(
                    model=self.model,
                    file=audio_file,
                    language="pt",
                    response_format="verbose_json",
                    timestamp_granularities=["word"]
                )
            
            words = transcription.words
            logger.info(f"Generated {len(words)} subtitle words.")
            return words
            
        except Exception as e:
            logger.error(f"Subtitle transcription failed: {e}")
            return []
