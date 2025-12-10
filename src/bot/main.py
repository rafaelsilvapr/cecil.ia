import src.bot.force_ipv4 # Force IPv4 before anything else
import asyncio
import logging
from src.bot.bot_instance import bot
import src.bot.handlers # Import to register handlers via decorators

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

async def main():
    print("Bot is running (AsyncTeleBot)...")
    await bot.polling(request_timeout=60)

if __name__ == '__main__':
    asyncio.run(main())
