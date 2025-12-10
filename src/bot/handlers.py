import logging
import os
import asyncio
from telebot.types import Message, CallbackQuery, InlineKeyboardMarkup, InlineKeyboardButton
from src.bot.bot_instance import bot
from src.bot.states import BotState

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

import json

# Persistence file
STATE_FILE = "bot_state.json"

def load_persistence():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                data = json.load(f)
                # Convert state strings back to Enum if needed, or just handle as strings/ints
                # For simplicity, we'll store states as integers (values of the Enum)
                return data.get('states', {}), data.get('data', {})
        except Exception as e:
            logger.error(f"Failed to load state: {e}")
    return {}, {}

def save_persistence():
    try:
        data = {
            'states': user_states,
            'data': user_data
        }
        with open(STATE_FILE, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        logger.error(f"Failed to save state: {e}")

# Load initial state
user_states, user_data = load_persistence()

# Helper to convert state enum to int for storage if needed, 
# but python dicts can handle keys as strings (chat_id is int, but json converts keys to string)
# We need to handle chat_id conversion (JSON keys are always strings)

def get_state(chat_id):
    # JSON keys are strings, so we might need to cast chat_id to string to lookup
    state_val = user_states.get(str(chat_id))
    if state_val is None:
        return BotState.WAITING_FOR_PDF
    return state_val

def set_state(chat_id, state):
    user_states[str(chat_id)] = state
    save_persistence()

def get_data(chat_id):
    if str(chat_id) not in user_data:
        user_data[str(chat_id)] = {}
    return user_data[str(chat_id)]

def save_data(chat_id):
    # Call this after modifying user_data[chat_id]
    save_persistence()

@bot.message_handler(commands=['start'])
async def start(message: Message):
    """Send a welcome message and request a PDF."""
    chat_id = message.chat.id
    await bot.reply_to(message, 
        "Welcome! I am your AI Video Producer.\n"
        "Please send me a research article PDF to get started."
    )
    set_state(chat_id, BotState.WAITING_FOR_PDF)

@bot.message_handler(content_types=['document'])
async def handle_pdf(message: Message):
    """Handle the PDF upload."""
    chat_id = message.chat.id
    document = message.document
    
    if document.mime_type != 'application/pdf':
        await bot.reply_to(message, "Please send a valid PDF file.")
        return

    file_info = await bot.get_file(document.file_id)
    downloaded_file = await bot.download_file(file_info.file_path)
    
    # Create a temporary directory for downloads if it doesn't exist
    download_dir = "downloads"
    os.makedirs(download_dir, exist_ok=True)
    
    pdf_path = os.path.join(download_dir, f"{document.file_id}.pdf")
    with open(pdf_path, 'wb') as new_file:
        new_file.write(downloaded_file)
    
    await bot.reply_to(message, f"Downloaded {document.file_name}. Extracting text...")
    
    try:
        from src.ingestion.pdf_processor import extract_text_from_pdf
        # Note: extract_text_from_pdf is synchronous, might block loop slightly but okay for now
        extracted_data = extract_text_from_pdf(pdf_path)
        
        # Store extracted data
        data = get_data(chat_id)
        data['pdf_extracted'] = extracted_data
        save_data(chat_id)
        
        await bot.send_message(chat_id,
            f"Extraction complete!\n"
            f"Title: {extracted_data.get('title')}\n"
            f"Pages: {extracted_data.get('page_count')}\n"
            f"Starting analysis... This may take a minute."
        )
        
        set_state(chat_id, BotState.PROCESSING_PDF)
        
        # Run Agents
        from src.agents.academic_agent import AcademicAgent
        from src.agents.social_agent import SocialAgent
        from src.agents.synthesis_agent import SynthesisAgent
        from src.agents.script_agent import ScriptAgent

        # 1. Academic Analysis
        academic_agent = AcademicAgent()
        academic_report = await academic_agent.analyze(extracted_data)
        await bot.send_message(chat_id, "✅ Academic analysis complete.")

        # 2. Social Analysis
        social_agent = SocialAgent()
        social_report = await social_agent.analyze(extracted_data)
        await bot.send_message(chat_id, "✅ Social media trends analysis complete.")

        # 3. Synthesis
        synthesis_agent = SynthesisAgent()
        knowledge_base = await synthesis_agent.synthesize(academic_report, social_report)
        data['knowledge_base'] = knowledge_base
        save_data(chat_id)
        
        # 4. Script Generation
        script_agent = ScriptAgent()
        script = await script_agent.generate_script(knowledge_base)
        data['current_script'] = script
        save_data(chat_id)
        
        # Send Script for Review
        keyboard = InlineKeyboardMarkup()
        keyboard.row(
            InlineKeyboardButton("Approve Script", callback_data='approve_script'),
            InlineKeyboardButton("Edit Script", callback_data='edit_script_instruction')
        )
        
        # Send Synthesis Report for Review
        kb_text = (
            f"🧠 **Relatório de Síntese (Base do Roteiro):**\n\n"
            f"📌 **Mensagem Central:** {knowledge_base.get('core_message')}\n\n"
            f"🎣 **Estratégia de Gancho:** {knowledge_base.get('hook_strategy')}\n\n"
            f"💡 **Insights Chave:**\n" + 
            "\n".join([f"- {i}" for i in knowledge_base.get('key_insights_for_script', [])]) + "\n\n"
            f"🎨 **Direção Visual:** {knowledge_base.get('visual_direction')}\n"
            f"🗣️ **Tom de Voz:** {knowledge_base.get('tone_guide')}\n"
        )
        
        # Send split messages if too long, but usually this is short enough
        # Removing parse_mode='Markdown' to prevent errors with unescaped characters from AI
        await bot.send_message(chat_id, kb_text)

        await bot.send_message(chat_id,
            f"🎬 **Generated Script:**\n\n{script}",
            parse_mode='Markdown',
            reply_markup=keyboard
        )
        
        set_state(chat_id, BotState.REVIEWING_SCRIPT)
        
    except Exception as e:
        logger.error(f"Processing error: {e}")
        await bot.reply_to(message, "Failed to process the PDF.")
        set_state(chat_id, BotState.WAITING_FOR_PDF)

@bot.callback_query_handler(func=lambda call: True)
async def handle_query(call: CallbackQuery):
    """Handle callback queries."""
    chat_id = call.message.chat.id
    data = call.data
    user_d = get_data(chat_id)
    
    if data == 'approve_script':
        await bot.answer_callback_query(call.id, "Script approved!")
        await bot.edit_message_reply_markup(chat_id, call.message.message_id, reply_markup=None)
        
        keyboard = InlineKeyboardMarkup()
        keyboard.row(
            InlineKeyboardButton("AI will narrate", callback_data='narrate_ai'),
            InlineKeyboardButton("I will narrate", callback_data='narrate_user')
        )
        
        await bot.send_message(chat_id, "Who will narrate the video?", reply_markup=keyboard)
        set_state(chat_id, BotState.WAITING_FOR_NARRATION_CHOICE)

    elif data == 'edit_script_instruction':
        await bot.answer_callback_query(call.id)
        await bot.send_message(chat_id, "Please send me your feedback or the revised text.")
        # State remains REVIEWING_SCRIPT

    elif data == 'narrate_ai':
        await bot.answer_callback_query(call.id)
        await bot.edit_message_reply_markup(chat_id, call.message.message_id, reply_markup=None)
        await bot.send_message(chat_id, "Generating AI narration... 🎙️")
        
        current_script = user_d.get('current_script', "")
        
        # Clean script
        # Clean script for audio (remove Visual, Tempo, labels)
        import re
        # Remove lines starting with **Visual:** or **Tempo:**
        clean_text = re.sub(r'\*\*Visual:\*\*.*', '', current_script)
        clean_text = re.sub(r'\*\*Tempo:\*\*.*', '', clean_text)
        # Remove **Texto:** label
        clean_text = re.sub(r'\*\*Texto:\*\*', '', clean_text)
        # Remove empty lines
        clean_text = os.linesep.join([s for s in clean_text.splitlines() if s.strip()])
        
        # Generate Audio
        from src.media.audio_generator import AudioGenerator
        audio_gen = AudioGenerator()
        
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        audio_path = os.path.join(output_dir, "final_voiceover.mp3")
        
        try:
            await audio_gen.generate_narration(clean_text, audio_path)
            user_d['audio_path'] = audio_path
            save_data(chat_id)
            save_data(chat_id)
            
            await bot.send_message(chat_id, "Audio generated! Starting video production... 🎬")
            await generate_video_flow(chat_id, user_d)
            
        except Exception as e:
            logger.error(f"Audio generation failed: {e}")
            await bot.send_message(chat_id, "Failed to generate audio.")

    elif data == 'narrate_user':
        await bot.answer_callback_query(call.id)
        await bot.edit_message_reply_markup(chat_id, call.message.message_id, reply_markup=None)
        await bot.send_message(chat_id, "Please record a voice message or upload an audio file.")
        set_state(chat_id, BotState.WAITING_FOR_VOICE_UPLOAD)

@bot.message_handler(content_types=['text'])
async def handle_text(message: Message):
    chat_id = message.chat.id
    state = get_state(chat_id)
    user_d = get_data(chat_id)
    
    if state == BotState.REVIEWING_SCRIPT:
        user_feedback = message.text
        current_script = user_d.get('current_script', "")
        
        await bot.reply_to(message, "Revising script based on your feedback...")
        
        from src.agents.script_agent import ScriptAgent
        script_agent = ScriptAgent()
        revised_script = await script_agent.revise_script(current_script, user_feedback)
        
        user_d['current_script'] = revised_script
        save_data(chat_id)
        
        keyboard = InlineKeyboardMarkup()
        keyboard.row(
            InlineKeyboardButton("Approve Script", callback_data='approve_script'),
            InlineKeyboardButton("Edit Script", callback_data='edit_script_instruction')
        )
        
        await bot.send_message(chat_id,
            f"🎬 **Revised Script:**\n\n{revised_script}",
            parse_mode='Markdown',
            reply_markup=keyboard
        )

@bot.message_handler(content_types=['voice', 'audio'])
async def handle_voice(message: Message):
    chat_id = message.chat.id
    state = get_state(chat_id)
    user_d = get_data(chat_id)
    
    if state == BotState.REVIEWING_SCRIPT:
        await bot.reply_to(message, "🎤 Listening to your feedback...")
        
        # Download voice
        voice = message.voice or message.audio
        file_info = await bot.get_file(voice.file_id)
        downloaded_file = await bot.download_file(file_info.file_path)
        
        # Save temp file
        temp_dir = "temp_audio"
        os.makedirs(temp_dir, exist_ok=True)
        voice_path = os.path.join(temp_dir, f"feedback_{voice.file_id}.ogg")
        
        with open(voice_path, 'wb') as new_file:
            new_file.write(downloaded_file)
            
        # Transcribe
        try:
            from src.media.transcription_service import TranscriptionService
            transcriber = TranscriptionService()
            feedback_text = await transcriber.transcribe_audio(voice_path)
            
            await bot.send_message(chat_id, f"📝 **Transcribed Feedback:**\n_{feedback_text}_", parse_mode='Markdown')
            await bot.send_message(chat_id, "Revising script based on this feedback...")
            
            # Revise Script
            current_script = user_d.get('current_script', "")
            from src.agents.script_agent import ScriptAgent
            script_agent = ScriptAgent()
            revised_script = await script_agent.revise_script(current_script, feedback_text)
            
            user_d['current_script'] = revised_script
            save_data(chat_id)
            
            keyboard = InlineKeyboardMarkup()
            keyboard.row(
                InlineKeyboardButton("Approve Script", callback_data='approve_script'),
                InlineKeyboardButton("Edit Script", callback_data='edit_script_instruction')
            )
            
            await bot.send_message(chat_id,
                f"🎬 **Revised Script:**\n\n{revised_script}",
                parse_mode='Markdown',
                reply_markup=keyboard
            )
            
            # Cleanup
            os.remove(voice_path)
            
        except Exception as e:
            logger.error(f"Voice feedback error: {e}")
            await bot.reply_to(message, "Failed to process voice feedback.")

    elif state == BotState.WAITING_FOR_VOICE_UPLOAD:
        voice = message.voice or message.audio
        file_info = await bot.get_file(voice.file_id)
        downloaded_file = await bot.download_file(file_info.file_path)
        
        output_dir = "output"
        os.makedirs(output_dir, exist_ok=True)
        audio_path = os.path.join(output_dir, "final_voiceover.mp3")
        
        with open(audio_path, 'wb') as new_file:
            new_file.write(downloaded_file)
            
        user_d['audio_path'] = audio_path
        save_data(chat_id)
        
        await bot.reply_to(message, "Voice received! Starting video production... 🎬")
        await generate_video_flow(chat_id, user_d)

async def generate_video_flow(chat_id, user_d):
    """Orchestrates image generation, video composition, and delivery."""
    await bot.send_message(chat_id, "🎨 Generating visuals (this takes a moment)...")
    
    current_script = user_d.get('current_script', "")
    audio_path = user_d.get('audio_path')
    
    # 1. Generate Images
    from src.media.image_generator import ImageGenerator
    image_gen = ImageGenerator()
    output_dir = "output"
    
    try:
        image_paths = await image_gen.generate_images(current_script, output_dir)
        
        if not image_paths:
            await bot.send_message(chat_id, "Failed to generate images. Aborting.")
            return

        await bot.send_message(chat_id, f"✅ Generated {len(image_paths)} images. Composing video...")
        
        # 1.5 Generate Subtitles (New Step)
        subtitles = []
        try:
            from src.media.transcription_service import TranscriptionService
            transcriber = TranscriptionService()
            await bot.send_message(chat_id, "📝 Generating subtitles...")
            subtitles = await transcriber.transcribe_for_subtitles(audio_path)
        except Exception as e:
            logger.error(f"Subtitle generation failed: {e}")
            # Continue without subtitles
        
        # 2. Compose Video
        from src.media.video_composer import VideoComposer
        composer = VideoComposer()
        video_path = os.path.join(output_dir, "final_video.mp4")
        
        # Compose video (synchronous call, might block loop, but okay for MVP)
        composer.compose_video(audio_path, image_paths, video_path, subtitles=subtitles)
        
        await bot.send_message(chat_id, "✅ Video composed! Uploading...")
        
        # 3. Send to User
        with open(video_path, 'rb') as video:
            await bot.send_video(chat_id, video, caption="Here is your AI-generated video! 🚀")
        
        # 4. Automatic Publication
        from src.services.publication_service import PublicationService
        pub_service = PublicationService()
        
        kb = user_d.get('knowledge_base', {})
        metadata = {
            "title": kb.get("core_message", "AI Research Video"),
            "description": kb.get("hook_strategy", "Generated by AI"),
            "hashtags": "#Research #AI #Education"
        }
        
        pub_service.publish_video(video_path, metadata)
        await bot.send_message(chat_id, "✅ Sent to publication webhook (Zapier).")
        
        set_state(chat_id, BotState.WAITING_FOR_PDF)
        
    except Exception as e:
        logger.error(f"Video production failed: {e}")
        await bot.send_message(chat_id, f"Video production failed: {e}")

