import requests
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    print(f"Testing POST with token: {token[:5]}...")
    
    url = f"https://api.telegram.org/bot{token}/getMe"
    
    try:
        response = requests.post(url, timeout=60, verify=False)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
