import logging
import os
from moviepy import *

logger = logging.getLogger(__name__)

class VideoComposer:
    def compose_video(self, audio_path: str, image_paths: list, output_path: str, subtitles: list = None):
        """
        Composes the final video using audio and images, optionally with subtitles.
        
        Args:
            audio_path (str): Path to the voiceover audio.
            image_paths (list): List of paths to images.
            output_path (str): Path to save the final video.
            subtitles (list): List of word timestamps from Whisper.
        """
        logger.info("Composing Video...")
        
        try:
            # Load audio
            audio = AudioFileClip(audio_path)
            duration = audio.duration
            
            if not image_paths:
                raise ValueError("No images provided for video composition.")
            
            # Calculate duration per image
            img_duration = duration / len(image_paths)
            
            clips = []
            for img_path in image_paths:
                clip = ImageClip(img_path).with_duration(img_duration)
                # Resize to 1080x1920 if needed, but DALL-E 3 generates 1024x1792 which is close enough for now
                # or we can resize/crop. Let's just center it on a black background if needed.
                # For simplicity, we assume the images are already vertical-ish.
                clips.append(clip)
            
            # Concatenate clips
            video = concatenate_videoclips(clips, method="compose")
            
            # Add Subtitles if provided
            if subtitles:
                logger.info("Overlaying subtitles...")
                text_clips = []
                
                # Group words into chunks of ~3-5 words for readability
                chunk_size = 4
                for i in range(0, len(subtitles), chunk_size):
                    chunk = subtitles[i:i+chunk_size]
                    if not chunk: continue
                    
                    # Handle both dict (if mocked) and object (if real API)
                    first_word = chunk[0]
                    last_word = chunk[-1]
                    
                    if isinstance(first_word, dict):
                        text = " ".join([w['word'] for w in chunk])
                        start_time = first_word['start']
                        end_time = last_word['end']
                    else:
                        text = " ".join([w.word for w in chunk])
                        start_time = first_word.start
                        end_time = last_word.end
                    
                    # Create TextClip
                    # Note: TextClip requires ImageMagick. If missing, this will fail.
                    # We use a try/except block inside to warn but continue if it fails.
                    try:
                        txt_clip = TextClip(
                            text=text,
                            font_size=50,
                            color='white',
                            font='Arial-Bold',
                            stroke_color='black',
                            stroke_width=2,
                            method='caption',
                            size=(video.w * 0.8, None), # 80% width
                            text_align='center'
                        )
                        txt_clip = txt_clip.with_position(('center', 'bottom')).with_start(start_time).with_end(end_time)
                        text_clips.append(txt_clip)
                    except Exception as e:
                        logger.warning(f"Failed to create TextClip (ImageMagick missing?): {e}")
                        break # Stop trying to add subtitles if one fails
                
                if text_clips:
                    video = CompositeVideoClip([video, *text_clips])
            
            # Set audio
            video = video.with_audio(audio)
            
            # Write file
            video.write_videofile(output_path, fps=24, codec='libx264', audio_codec='aac')
            logger.info(f"Video saved to {output_path}")
            
            return output_path

        except Exception as e:
            logger.error(f"Error composing video: {e}")
            raise
