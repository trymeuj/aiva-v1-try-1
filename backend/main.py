from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from gemini import GeminiChatbot

# Initialize FastAPI app
app = FastAPI(title="Chatbot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the chatbot
chatbot = GeminiChatbot()

# Define data models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    success: bool
    reply: Optional[str] = None
    conversationHistory: Optional[List[Message]] = None
    error: Optional[str] = None

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        user_message = request.message
        conversation_history = request.conversationHistory
        
        # Convert Pydantic models to dictionaries for the chatbot service
        history_dicts = [msg.dict() for msg in conversation_history]
        
        # Get response from the chatbot
        reply = await chatbot.get_response(user_message, history_dicts)
        
        # Update conversation history
        updated_history = conversation_history + [
            Message(role="user", content=user_message),
            Message(role="assistant", content=reply)
        ]
        
        return ChatResponse(
            success=True,
            reply=reply,
            conversationHistory=updated_history
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.get("/")
async def root():
    return {"message": "Chatbot API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)