import aiohttp
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    url = f"https://api.telegram.org/bot{token}/getMe"
    
    print(f"Testing aiohttp with url: {url.replace(token, 'TOKEN')}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                print(f"Status: {response.status}")
                print(f"Response: {await response.text()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
