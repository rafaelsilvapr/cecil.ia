import os
from telebot.async_telebot import AsyncTeleBot
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("TELEGRAM_BOT_TOKEN")
bot = AsyncTeleBot(token)
