import httpx
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{token}/getMe"
    
    print(f"Testing httpx with url: {url.replace(token, 'TOKEN')}")
    
    try:
        async with httpx.AsyncClient(http2=False, verify=False) as client:
            response = await client.get(url, timeout=10)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
