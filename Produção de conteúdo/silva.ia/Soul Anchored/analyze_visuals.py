import pandas as pd
import json
import os
import subprocess
import time
import google.generativeai as genai
from PIL import Image

GEMINI_API_KEY = "AIzaSyCHHoFNBL9giPE3m7fUhLNcHMEVVFrk980" 
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

CSV_FILE = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Soul Anchored/concorrentes_youtube_top30_consolidado - concorrentes_youtube_top30_consolidado.csv.csv"
OUTPUT_JSON = "/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Soul Anchored/visual_analysis_results.json"
TEMP_DIR = "/tmp/video_analysis"
os.makedirs(TEMP_DIR, exist_ok=True)

def analyze_visuals_from_thumbnail(titulo, canal, duracao, thumbnail_url):
    print(f"Analyzing: {titulo} ({canal}) with thumbnail {thumbnail_url}")
    thumb_path = os.path.join(TEMP_DIR, "thumb.jpg")
    try:
        subprocess.run(["curl", "-s", "-L", thumbnail_url, "-o", thumb_path], check=True)
    except Exception as e:
        return {"error": "thumbnail_download_failed"}

    try:
        if not os.path.exists(thumb_path):
            return {"error": "thumbnail_file_missing"}
            
        features = [Image.open(thumb_path)]

        prompt = f"""
        You are an expert YouTube video analyst. I have provided you the video thumbnail, along with the title, channel name, and duration.
        
        Title: {titulo}
        Channel: {canal}
        Duration: {duracao}
        
        Since I cannot provide the video frames directly, I need you to infer the visual style of the video based heavily on typical YouTube patterns for this genre, the title, the channel name, and the thumbnail.
        
        Analyze this information and answer two questions formatting your response STRICTLY as a JSON object:
        {{
           "is_loop": boolean, // True if videos with this title/thumbnail/duration in this niche (Christian motivation/prayers) are typically just a static image or a very simple repeating loop (e.g., a static landscape, a fireplace, a looping space animation) while audio plays. False if this channel/format typically uses dynamic edits, different scenes, or human speakers changing on camera. (Note: videos over 1 hour are almost always loops).
           "thumbnail_matches_video_aesthetic": boolean, // Make an educated guess: True if the visual style and content of the thumbnail is likely what the viewer sees in the loop/video. False if the thumbnail is clearly clickbait (e.g., dramatic AI art of a battle in the thumbnail, but the video is likely just a static cross).
           "notes": "Brief explanation of your reasoning."
        }}
        """
        features.append(prompt)
        response = model.generate_content(features)
        resp_text = response.text.replace('```json\n', '').replace('```', '').strip()
        return json.loads(resp_text)
    except Exception as e:
        return {"error": f"gemini_analysis_failed: {str(e)}"}

def main():
    # Load without assuming header since the comma count is weird
    df = pd.read_csv(CSV_FILE, header=None, skiprows=1)
    
    # Process all rows
    # df = df.head(5) # For testing
    
    results = []
    total = len(df)
    
    for index, row in df.iterrows():
        # The correct columns based on the raw file view
        canal = row[0]
        titulo = row[2]
        duracao = row[7]
        video_url = row[8]
        thumbnail_url = row[9]
        
        if pd.isna(video_url) or pd.isna(thumbnail_url) or not str(video_url).startswith('http'): 
            continue
            
        print(f"[{index+1}/{total}] ", end="")
        analysis = analyze_visuals_from_thumbnail(titulo, canal, duracao, thumbnail_url)
        results.append({
            "canal": canal,
            "titulo": titulo,
            "duracao": duracao,
            "link": video_url,
            "analysis": analysis
        })
        
        # Save incrementally
        with open(OUTPUT_JSON, 'w') as f:
            json.dump(results, f, indent=4, ensure_ascii=False)
            
        time.sleep(1.5) # Rate limiting
        
    print(f"Done! Saved {len(results)} results to {OUTPUT_JSON}")

if __name__ == "__main__":
    main()
