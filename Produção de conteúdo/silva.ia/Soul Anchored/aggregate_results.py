import json
import os

try:
    filepath = '/Users/rafaelrodriguesdasilva/Documents/Agentes - Antigravity/Soul Anchored/visual_analysis_results.json'
    if not os.path.exists(filepath):
        print("Results file not found yet.")
        exit(0)
        
    with open(filepath, 'r') as f:
        data = json.load(f)
        
    loops = 0
    matches = 0
    errors = 0
    valid = 0
    
    for item in data:
        analysis = item.get('analysis', {})
        if 'error' in analysis:
            errors += 1
            print(f"Error on {item.get('titulo')}: {analysis['error']}")
            continue
            
        valid += 1
        if analysis.get('is_loop') is True:
            loops += 1
            
        if analysis.get('thumbnail_matches_video_aesthetic') is True:
            matches += 1
            
    print(f"\n--- Current Statistics ({valid} valid results so far) ---")
    if valid > 0:
        print(f"Videos classified as Loops (or static scenes): {loops} ({loops/valid*100:.1f}%)")
        print(f"Thumbnails that match video aesthetic: {matches} ({matches/valid*100:.1f}%)")
        print(f"Videos classified as Dynamic: {valid - loops} ({(valid - loops)/valid*100:.1f}%)")
        print(f"Thumbnails that DO NOT match video aesthetic: {valid - matches} ({(valid - matches)/valid*100:.1f}%)")
    print(f"Errors: {errors}")
    print(f"Total processed: {len(data)}")
    
except Exception as e:
    print("Error analyzing:", e)
