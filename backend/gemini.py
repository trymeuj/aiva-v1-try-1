import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class GeminiChatbot:
    def __init__(self, model_name="gemini-2.0-flash"):
        self.model = genai.GenerativeModel(model_name)
    
    async def get_response(self, message: str, conversation_history: List[Dict[str, str]]):
        # Convert conversation history to Gemini's format
        gemini_history = []
        for msg in conversation_history:
            if msg["role"] == "user":
                gemini_history.append({"role": "user", "parts": [msg["content"]]})
            elif msg["role"] == "assistant":
                gemini_history.append({"role": "model", "parts": [msg["content"]]})
        
        # Start a chat session
        chat = self.model.start_chat(history=gemini_history)
        
        # Generate a response
        response = await chat.send_message_async(message)
        
        # Return the text response
        return response.text