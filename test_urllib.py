import urllib.request
import urllib.error
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{token}/getMe"
    
    print(f"Testing urllib with url: ...{token[-5:]}/getMe")
    
    # Create a context that doesn't verify certificates (just to test connectivity first)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        with urllib.request.urlopen(url, context=ctx, timeout=20) as response:
            print(f"Status: {response.status}")
            print(f"Response: {response.read().decode('utf-8')}")
    except urllib.error.URLError as e:
        print(f"URLError: {e.reason}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
