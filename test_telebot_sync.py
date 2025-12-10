import os
from telebot import TeleBot
from dotenv import load_dotenv

load_dotenv()

def main():
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    print(f"Testing Synchronous TeleBot with token: {token[:5]}...")
    
    bot = TeleBot(token)
    
    try:
        me = bot.get_me()
        print(f"Bot info: {me.username} (ID: {me.id})")
        print("Synchronous TeleBot connection SUCCESS.")
    except Exception as e:
        print(f"Synchronous TeleBot connection FAILED: {e}")

if __name__ == "__main__":
    main()
