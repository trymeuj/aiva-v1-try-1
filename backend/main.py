from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal, Dict, Any
from gemini import GeminiChatbot
from google_search import GoogleSearchClient
from youcom_api import YouComClient  # Import our new You.com client
import json
import os
import logging
from datetime import datetime, timedelta
from utils import generate_session_id, format_action_for_confirmation


# Import the new orchestrator components
# We'll create these files next
from orchestrator import Orchestrator
from workflow_connector import setup_workflow_routes
from intent_extractor import extract_api_intentions

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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Initialize the chatbot and API clients
chatbot = GeminiChatbot()
search_client = GoogleSearchClient()
youcom_client = YouComClient()  # Initialize You.com client

# Load API registry for the orchestrator
def load_api_registry():
    try:
        api_info_path = os.path.join(os.path.dirname(__file__), "api_info")
        if os.path.exists(api_info_path):
            with open(api_info_path, "r") as f:
                return json.load(f)
        else:
            logger.warning(f"API info file not found at {api_info_path}")
            return []
    except Exception as e:
        logger.error(f"Error loading API registry: {e}")
        return []

# Initialize orchestrator with API registry
try:
    api_registry = load_api_registry()
    orchestrator = Orchestrator(api_registry)
    logger.info("Orchestrator initialized successfully")
except Exception as e:
    logger.error(f"Error initializing orchestrator: {e}")
    orchestrator = None

# Initialize the workflow connector with the orchestrator
if orchestrator:
    try:
        # Set up the workflow routes
        setup_workflow_routes(app, orchestrator)
        logger.info("Workflow routes initialized successfully")
    except Exception as e:
        logger.error(f"Error setting up workflow routes: {e}")

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

# New models for orchestrator
class WorkflowStep(BaseModel):
    software: str
    api: Dict[str, str]
    parameters: Optional[Dict[str, Any]] = {}
    reasoning: Optional[str] = None

class WorkflowRequest(BaseModel):
    workflow: List[WorkflowStep]
    session_id: Optional[str] = None

class StepExecutionRequest(BaseModel):
    session_id: str
    step_id: Optional[str] = None
    additional_context: Optional[Dict[str, Any]] = None

class ClarificationRequest(BaseModel):
    session_id: str
    step_id: str
    responses: Dict[str, Any]

# Your existing endpoints remain here
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Existing implementation...
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
    # Existing implementation...
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
    # Existing implementation...
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
    # Existing implementation...
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
    # Existing implementation...
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

# New orchestrator endpoints
@app.post("/orchestrator/create-plan")
async def create_plan(request: WorkflowRequest):
    """
    Create an execution plan from a workflow.
    """
    if not orchestrator:
        raise HTTPException(status_code=500, detail="Orchestrator not initialized")
        
    try:
        # Convert Pydantic models to dicts
        workflow_dict = [step.dict() for step in request.workflow]
        
        # Create the execution plan
        plan = orchestrator.create_execution_plan(workflow_dict, request.session_id)
        return plan
    except Exception as e:
        logger.error(f"Error creating plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestrator/execute-step")
async def execute_step(request: StepExecutionRequest):
    """
    Execute a single step in the workflow.
    """
    if not orchestrator:
        raise HTTPException(status_code=500, detail="Orchestrator not initialized")
        
    try:
        result = await orchestrator.execute_step(
            request.session_id, 
            request.step_id, 
            request.additional_context
        )
        return result
    except Exception as e:
        logger.error(f"Error executing step: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestrator/provide-clarification")
async def provide_clarification(request: ClarificationRequest):
    """
    Provide user responses to clarification questions.
    """
    if not orchestrator:
        raise HTTPException(status_code=500, detail="Orchestrator not initialized")
        
    try:
        result = await orchestrator.provide_clarification(
            request.session_id,
            request.step_id,
            request.responses
        )
        return result
    except Exception as e:
        logger.error(f"Error processing clarification: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestrator/api-registry")
async def get_api_registry_endpoint():
    """
    Get the API registry.
    """
    return load_api_registry()

@app.get("/")
async def root():
    return {"message": "Chatbot API is running"}

@app.post("/api/agent", response_model=ChatResponse)
async def agent_request(request: ChatRequest):
    """
    Process a user request through the intent extraction and orchestration pipeline.
    """
    try:
        user_message = request.message
        conversation_history = request.conversationHistory
        
        api_messages = []
        for msg in conversation_history:
            # If it's a Pydantic model
            if hasattr(msg, "role") and hasattr(msg, "content"):
                api_messages.append({"role": msg.role, "content": msg.content})
            # If it's a dictionary
            elif isinstance(msg, dict) and "role" in msg and "content" in msg:
                api_messages.append({"role": msg.role, "content": msg.content})

        # Generate a consistent session ID from conversation history if possible
        session_id = generate_session_id(conversation_history)
        
        # Check if this might be a confirmation for a pending action
        pending_workflow = None
        if orchestrator:
            pending_workflow = orchestrator.get_pending_confirmation(session_id)
        
        # Extract API intentions
        api_key = os.environ.get("GOOGLE_API_KEY")
        api_ref_data = load_api_registry()
        intent_result = await extract_api_intentions(user_message, api_ref_data, api_key, pending_workflow)
        
        # Check if it's a confirmation of a pending action
        if intent_result.get("isConfirmation", False) and pending_workflow:
            # Create an execution plan using the stored workflow
            plan_result = orchestrator.create_execution_plan(pending_workflow, session_id)
            
            # Execute the first step automatically
            first_step_id = plan_result["plan"][0]["id"] if plan_result["plan"] else None
            if first_step_id:
                execution_result = await orchestrator.execute_step(plan_result["session_id"], first_step_id)
                
                # Clear the pending confirmation
                orchestrator.clear_pending_confirmation(session_id)
                
                # Return the execution result
                result_message = "✅ Action executed: "
                if execution_result.get("status") == "completed":
                    if "result" in execution_result:
                        result_message += f"Operation completed successfully."
                    else:
                        result_message += "Task completed successfully."
                else:
                    result_message += f"Status: {execution_result.get('status', 'unknown')}"
                    if "error" in execution_result:
                        result_message += f"\nError: {execution_result['error']}"
                
                return ChatResponse(
                    success=True,
                    reply=result_message,
                    conversationHistory=conversation_history + [
                        Message(role="user", content=user_message),
                        Message(role="assistant", content=result_message)
                    ]
                )
        
        # Check if there's an agent intention for a new action
        if intent_result.get("hasAgentIntention", False) and intent_result.get("workflow"):
            # Store this for confirmation instead of immediate execution
            workflow = intent_result["workflow"]
            if orchestrator:
                orchestrator.store_pending_confirmation(session_id, workflow)
            
            # Format a confirmation message
            action_description = format_action_for_confirmation(workflow)
            confirmation_message = f"I'll help you with that. Just to confirm, I'm going to {action_description}\n\nIs that correct?"
            
            return ChatResponse(
                success=True,
                reply=confirmation_message,
                conversationHistory=conversation_history + [
                    Message(role="user", content=user_message),
                    Message(role="assistant", content=confirmation_message)
                ],
                metadata={
                    "awaiting_confirmation": True,
                    "session_id": session_id
                }
            )
        
        # No agent intention detected, fall back to regular chat
        return await chat(request)
        
    except Exception as e:
        logger.error(f"Error in agent request: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

# Helper function to generate a consistent session ID
def generate_session_id(conversation_history):
    """Generate a consistent session ID from conversation history"""
    import hashlib
    if not conversation_history:
        return f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Use the first few messages to create a consistent hash
    first_messages = []
    for msg in conversation_history[:min(3, len(conversation_history))]:
        # Check if msg is a dict (which can use .get) or another type of object
        if isinstance(msg, dict):
            content = msg.get("content", "")
        else:
            # Assume it has a content attribute
            content = getattr(msg, "content", "")
        first_messages.append(content)
    
    hash_input = "".join(first_messages)
    return hashlib.md5(hash_input.encode()).hexdigest()

# Helper function to format action for confirmation message
def format_action_for_confirmation(workflow):
    """Format the workflow actions into a human-readable confirmation message"""
    if not workflow or len(workflow) == 0:
        return "perform this action"
    
    # Format the first action
    action = workflow[0]
    software = action.get("software", "")
    api_name = action.get("api", {}).get("name", "")
    
    if software == "gmail" and api_name == "send_email":
        params = action.get("parameters", {})
        to = params.get("to", "recipient")
        subject = params.get("subject", "")
        subject_text = f'with the subject "{subject}"' if subject else ""
        return f"send an email to {to} {subject_text}"
    
    # Add more formatting for other action types as needed
    
    return f"use {software} to {api_name}"


# Add endpoint to handle clarification responses
@app.post("/api/agent/clarify", response_model=ChatResponse)
async def provide_agent_clarification(request: ClarificationRequest):
    """
    Provide clarification for an agent request that needed more information.
    """
    try:
        # Get the result of providing clarification
        result = await orchestrator.provide_clarification(
            request.session_id,
            request.step_id,
            request.responses
        )
        
        # Continue executing steps
        # ... similar to the agent_request endpoint after clarification ...
        
        # For now, just return the result
        return ChatResponse(
            success=True,
            reply=json.dumps(result, indent=2)
        )
        
    except Exception as e:
        logger.error(f"Error providing clarification: {e}")
        return ChatResponse(
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)