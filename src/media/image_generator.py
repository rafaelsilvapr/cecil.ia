import logging
import os
from openai import OpenAI
import requests

logger = logging.getLogger(__name__)

class ImageGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "dall-e-3"

    async def generate_images(self, script: str, output_dir: str) -> list:
        """
        Generates images based on the script scenes.
        
        Args:
            script (str): The video script.
            output_dir (str): Directory to save images.
            
        Returns:
            list: List of paths to generated images.
        """
        logger.info("Generating Images...")
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract visual cues using regex
        import re
        # Matches **Visual:** ... (case insensitive, flexible spacing)
        visual_cues = re.findall(r'\*\*Visual:\*\*\s*(.*)', script, re.IGNORECASE)
        
        if not visual_cues:
             # Fallback 1: Try [Visual: ...] format
             visual_cues = re.findall(r'\[Visual: (.*?)\]', script, re.IGNORECASE)
        
        if not visual_cues:
             # Fallback 2: Try splitting by "Visual:" if it appears at start of lines
             lines = script.split('\n')
             for line in lines:
                 if 'Visual:' in line:
                     clean = line.replace('Visual:', '').replace('*', '').strip()
                     if clean:
                         visual_cues.append(clean)
        
        image_paths = []
        
        # Generate image for EACH visual cue found
        for i, cue in enumerate(visual_cues): 
            try:
                # Enhanced prompt to avoid text and ensure quality
                prompt = f"""
                Vertical 9:16 image for educational video. 
                Subject: {cue}. 
                Style: Modern, clean, high quality illustration or minimalist infographic. 
                IMPORTANT: Do NOT include any text, letters, or words in the image. Use icons and symbols only.
                """
                
                response = self.client.images.generate(
                    model=self.model,
                    prompt=prompt,
                    size="1024x1792",
                    quality="standard",
                    n=1,
                )
                
                image_url = response.data[0].url
                image_path = os.path.join(output_dir, f"frame_{i}.png")
                
                # Download image
                img_data = requests.get(image_url).content
                with open(image_path, 'wb') as handler:
                    handler.write(img_data)
                
                image_paths.append(image_path)
                logger.info(f"Generated image {i+1}/{len(visual_cues)}")
                
            except Exception as e:
                logger.error(f"Error generating image for cue {i}: {e}")
                # Continue even if one fails
        
        return image_paths
