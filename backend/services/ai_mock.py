import asyncio
import json
import random
import os
import tempfile
from dotenv import load_dotenv

# Try to load real API keys
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
else:
    client = None

async def process_audio_and_generate_response(audio_bytes: bytes) -> dict:
    """
    Processes audio using OpenAI Whisper (STT) and GPT-4o-mini (LLM) if an API key is present.
    Otherwise, falls back to mock responses.
    """
    
    if not client or len(audio_bytes) < 1000:
        print("Using MOCK AI Pipeline (No API Key or audio too small)")
        await asyncio.sleep(1.5)
        return get_mock_response()

    print("Using REAL API Pipeline")
    try:
        # 1. Step: Save bytes to temp file for Whisper
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name

        # 2. Step: Speech to Text (Whisper)
        with open(temp_audio_path, "rb") as audio_file:
            transcript = await client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
        
        os.remove(temp_audio_path)
        print(f"User said: {transcript}")

        # 3. Step: LLM Processing
        # We tell the LLM to output a specific JSON structure so the Mirror widgets work
        system_prompt = """
        You are an AI Smart Mirror assistant. You are concise, helpful, and speak in short sentences.
        You must ALWAYS respond in valid JSON format exactly like this:
        {
            "text": "The spoken response here",
            "widget": {
                "name": "NONE",
                "data": {}
            }
        }
        If they ask about weather, use "name": "WEATHER" and provide "temp" (number) and "condition" (string) in "data".
        If they ask about schedule, use "name": "SCHEDULE" and provide a "meetings" array in "data".
        """

        completion = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript}
            ],
            response_format={ "type": "json_object" }
        )

        response_content = completion.choices[0].message.content
        return json.loads(response_content)

    except Exception as e:
        print(f"AI Pipeline Error: {e}")
        return get_mock_response()


def get_mock_response():
    scenarios = [
        {
            "type": "weather",
            "text": "It looks like it's going to be 72 degrees and sunny today.",
            "widget": {
                "name": "WEATHER",
                "data": { "temp": 72, "condition": "sunny" }
            }
        },
        {
            "type": "schedule",
            "text": "You have three meetings scheduled for today, starting at 10 AM.",
            "widget": {
                "name": "SCHEDULE",
                "data": {
                    "meetings": [
                        {"time": "10:00 AM", "title": "Team Sync"},
                        {"time": "1:00 PM", "title": "Design Review"},
                        {"time": "3:30 PM", "title": "1:1 with Manager"}
                    ]
                }
            }
        },
        {
            "type": "greeting",
            "text": "Good morning! You're looking wonderful today.",
            "widget": { "name": "NONE", "data": {} }
        }
    ]
    return random.choice(scenarios)
