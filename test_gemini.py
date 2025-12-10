import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

print("Testing Gemini API Generation...")
try:
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Hello, are you working?")
    print(f"SUCCESS! Response: {response.text}")
except Exception as e:
    print(f"FAILED. Error: {e}")
