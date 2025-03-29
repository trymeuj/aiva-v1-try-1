from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
from gemini import GeminiChatbot
from google_search import GoogleSearchClient
from youcom_api import YouComClient  # Import our new You.com client

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

# Initialize the chatbot and API clients
chatbot = GeminiChatbot()
search_client = GoogleSearchClient()
youcom_client = YouComClient()  # Initialize You.com client

# Define data models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Message]] = []

class SearchRequest(BaseModel):
    query: str
    num_results: Optional[int] = 5
    instructions: Optional[str] = None

class ResearchRequest(BaseModel):
    query: str
    depth: Optional[Literal["basic", "comprehensive"]] = "comprehensive"

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

@app.post("/api/search", response_model=ChatResponse)
async def search(request: SearchRequest):
    try:
        query = request.query
        num_results = request.num_results
        
        # Perform search and format results
        search_results = await search_client.format_search_results(query, num_results)
        
        return ChatResponse(
            success=True,
            reply=search_results
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            error=str(e)
        )

# You.com Smart Search API endpoint
@app.post("/api/you/smart-search", response_model=ChatResponse)
async def you_smart_search(request: SearchRequest):
    try:
        query = request.query
        instructions = request.instructions
        
        # Perform You.com smart search and format results
        search_results = await youcom_client.format_smart_results(query, instructions)
        
        return ChatResponse(
            success=True,
            reply=search_results
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            error=str(e)
        )

# You.com Research API endpoint
@app.post("/api/you/research", response_model=ChatResponse)
async def you_research(request: ResearchRequest):
    try:
        query = request.query
        depth = request.depth
        
        # Perform You.com research and format results
        research_results = await youcom_client.format_research_results(query, depth)
        
        return ChatResponse(
            success=True,
            reply=research_results
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            error=str(e)
        )

@app.get("/test-you-api")
async def test_you_api():
    """Test the You.com API connection directly"""
    results = {
        "success": True,
        "smart_api_status": "Not tested",
        "research_api_status": "Not tested",
        "smart_api_result": "",
        "research_api_result": ""
    }
    
    # Test Smart API
    try:
        search_result = await youcom_client.smart_search("latest technology news")
        results["smart_api_status"] = "Working" if "answer" in search_result else "Error: No answer in response"
        results["smart_api_result"] = str(search_result)[:200] + "..." if len(str(search_result)) > 200 else str(search_result)
    except Exception as e:
        results["smart_api_status"] = f"Error: {str(e)}"
    
    # Test Research API
    try:
        research_result = await youcom_client.research("quantum computing applications")
        results["research_api_status"] = "Working" if "answer" in research_result else "Error: No answer in response"
        results["research_api_result"] = str(research_result)[:200] + "..." if len(str(research_result)) > 200 else str(research_result)
    
    except Exception as e:
        results["research_api_status"] = f"Error: {str(e)}"
    
    # Test formatted outputs
    if results["smart_api_status"] == "Working":
        try:
            formatted_search = await youcom_client.format_smart_results("latest technology news")
            results["formatted_smart_api"] = formatted_search[:300] + "..." if len(formatted_search) > 300 else formatted_search
        except Exception as e:
            results["formatted_smart_api"] = f"Error formatting: {str(e)}"
    
    if results["research_api_status"] == "Working":
        try:
            formatted_research = await youcom_client.format_research_results("quantum computing applications")
            results["formatted_research_api"] = formatted_research[:300] + "..." if len(formatted_research) > 300 else formatted_research
        except Exception as e:
            results["formatted_research_api"] = f"Error formatting: {str(e)}"
    
    # If both APIs failed, mark overall success as false
    if "Error" in results["smart_api_status"] and "Error" in results["research_api_status"]:
        results["success"] = False
    
    return results

@app.get("/")
async def root():
    return {"message": "Chatbot API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)