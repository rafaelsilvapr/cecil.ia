import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
BASE_URL = f"https://api.telegram.org/bot{TOKEN}"

def get_updates(offset=None):
    url = f"{BASE_URL}/getUpdates"
    params = {'timeout': 100, 'offset': offset}
    # FORCE GET
    response = requests.get(url, params=params, timeout=110)
    return response.json()

def main():
    print("Starting Custom GET Poller...")
    offset = None
    
    while True:
        try:
            updates = get_updates(offset)
            if "result" in updates:
                for update in updates["result"]:
                    offset = update["update_id"] + 1
                    print(f"Received update: {update}")
                    
                    # Check for message
                    if "message" in update:
                        msg = update["message"]
                        chat_id = msg["chat"]["id"]
                        
                        # Reply using GET
                        send_url = f"{BASE_URL}/sendMessage"
                        requests.get(send_url, params={'chat_id': chat_id, 'text': "I received your message via GET!"})
                        
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
