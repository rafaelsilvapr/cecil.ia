import os
import logging
import asyncio
from dotenv import load_dotenv
from telegram import Bot

load_dotenv()

from telegram.ext import ApplicationBuilder
from telegram.request import HTTPXRequest

async def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    print(f"Token found: {token[:5]}...{token[-5:]}")
    
    try:
        request = HTTPXRequest(http_version="1.1", connect_timeout=30, read_timeout=30)
        application = ApplicationBuilder().token(token).request(request).build()
        await application.initialize() # Explicitly initialize
        me = await application.bot.get_me()
        print(f"Bot info: {me.username} (ID: {me.id})")
        print("Token is VALID.")
        await application.shutdown()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
