"""
Connector between intent extractor and orchestrator
"""

import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException

# Import your intent extractor and orchestrator
from intent_extractor import extract_api_intentions, load_api_info
from orchestrator import Orchestrator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("workflow_connector")

# Create router for workflow endpoints
router = APIRouter(
    prefix="/workflow",
    tags=["workflow"],
)

# Initialize orchestrator
async def get_orchestrator():
    api_registry = await load_api_info()
    return Orchestrator(api_registry)

# Set up the routes
def setup_workflow_routes(app, orchestrator_instance):
    @router.post("/process")
    async def process_intent(request: Dict[str, Any]):
        """
        Process a natural language request through the intent extractor and orchestrator.
        
        This endpoint:
        1. Extracts API intentions from natural language
        2. Creates an execution plan
        3. Returns the plan for frontend rendering
        """
        try:
            # Extract user prompt from request
            user_prompt = request.get("userPrompt")
            if not user_prompt:
                raise HTTPException(status_code=400, detail="Missing 'userPrompt' in request")
                
            # Get the API key from request
            api_key = request.get("apiKey")
            if not api_key:
                raise HTTPException(status_code=400, detail="Missing 'apiKey' in request")
                
            # Load API information
            api_ref_data = await load_api_info()
            
            # Extract API intentions
            extraction_result = await extract_api_intentions(user_prompt, api_ref_data, api_key)
            
            # Check if there are any API intentions
            if not extraction_result.get("hasAgentIntention", False) or not extraction_result.get("workflow"):
                return {
                    "status": "no_intention",
                    "message": "No API actions detected in the request",
                    "extraction": extraction_result
                }
                
            # Create an execution plan using the orchestrator
            workflow = extraction_result.get("workflow", [])
            plan = orchestrator_instance.create_execution_plan(workflow)
            
            # Return the plan to the frontend
            return {
                "status": "plan_created",
                "session_id": plan["session_id"],
                "plan": plan["plan"],
                "message": "Plan created successfully",
                "extraction": extraction_result
            }
            
        except Exception as e:
            logger.error(f"Error processing intent: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Add orchestrator endpoints for step execution
    @router.post("/execute-step")
    async def execute_step(request: Dict[str, Any]):
        """Execute a single step in the workflow."""
        try:
            session_id = request.get("session_id")
            step_id = request.get("step_id")
            additional_context = request.get("additional_context")
            
            if not session_id:
                raise HTTPException(status_code=400, detail="Missing 'session_id' in request")
                
            result = await orchestrator_instance.execute_step(
                session_id, 
                step_id, 
                additional_context
            )
            return result
        except Exception as e:
            logger.error(f"Error executing step: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @router.post("/provide-clarification")
    async def provide_clarification(request: Dict[str, Any]):
        """Provide user responses to clarification questions."""
        try:
            session_id = request.get("session_id")
            step_id = request.get("step_id")
            responses = request.get("responses")
            
            if not session_id or not step_id or not responses:
                raise HTTPException(status_code=400, detail="Missing required fields in request")
                
            result = await orchestrator_instance.provide_clarification(
                session_id,
                step_id,
                responses
            )
            return result
        except Exception as e:
            logger.error(f"Error processing clarification: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Add the router to the app
    app.include_router(router)
    logger.info("Workflow routes initialized")