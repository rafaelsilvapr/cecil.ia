import asyncio
import os
from telebot.async_telebot import AsyncTeleBot
from dotenv import load_dotenv

load_dotenv()

async def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    print(f"Testing AsyncTeleBot with token: {token[:5]}...")
    
    bot = AsyncTeleBot(token)
    
    try:
        me = await bot.get_me()
        print(f"Bot info: {me.username} (ID: {me.id})")
        print("AsyncTeleBot connection SUCCESS.")
    except Exception as e:
        print(f"AsyncTeleBot connection FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(main())
