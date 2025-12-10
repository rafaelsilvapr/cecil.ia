import requests
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{token}/getMe"
    
    print(f"Checking identity for token ending in ...{token[-5:]}")
    
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        if data.get("ok"):
            user = data["result"]
            print(f"SUCCESS! Bot Username: @{user['username']}")
            print(f"Name: {user['first_name']}")
        else:
            print(f"FAILED. API Error: {data}")
    except Exception as e:
        print(f"NETWORK ERROR: {e}")

if __name__ == "__main__":
    main()
