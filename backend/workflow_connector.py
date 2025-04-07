"""
Connector between intent extractor and orchestrator
"""

import logging
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("workflow_connector")

def setup_workflow_routes(app, orchestrator_instance):
    """
    Set up the workflow routes for the FastAPI app.
    This function is called directly from main.py with the app and orchestrator instance.
    """
    # Create router for workflow endpoints
    router = APIRouter(
        prefix="/api/workflow",
        tags=["workflow"],
    )

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
            from intent_extractor import extract_api_intentions

            # Extract user prompt from request
            user_prompt = request.get("userPrompt")
            if not user_prompt:
                raise HTTPException(status_code=400, detail="Missing 'userPrompt' in request")
            
            # Get API key from environment in main.py, not here
            import os
            api_key = os.environ.get("GOOGLE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="Google API key not configured")
            
            # Load API information from main.py's function
            from main import load_api_registry
            api_ref_data = load_api_registry()
            
            # Extract API intentions
            extraction_result = await extract_api_intentions(user_prompt, api_ref_data, api_key)
            
            # Check if there are any API intentions
            if not extraction_result.get("hasAgentIntention", False) or not extraction_result.get("workflow"):
                return {
                    "status": "no_intention",
                    "message": "No API actions detected in the request",
                    "extraction": extraction_result,
                    "hasAgentIntention": False
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
                "extraction": extraction_result,
                "hasAgentIntention": True
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
    
    @router.get("/get-clarification/{session_id}/{step_id}")
    async def get_clarification(session_id: str, step_id: str):
        """Get clarification questions for a step."""
        try:
            # Fetch the current state of the step
            workflow_state = orchestrator_instance.get_workflow_state(session_id)
            if not workflow_state:
                raise HTTPException(status_code=404, detail=f"No workflow found with session ID {session_id}")
                
            # Find the specific step
            step = None
            for s in workflow_state["plan"]:
                if s["id"] == step_id:
                    step = s
                    break
                    
            if not step:
                raise HTTPException(status_code=404, detail=f"Step {step_id} not found in workflow {session_id}")
                
            # If the step needs clarification, return the questions
            if step["status"] == "needs_clarification":
                return {
                    "status": "needs_clarification",
                    "step_id": step_id,
                    "questions": step.get("clarification_questions", "I need more information to proceed.")
                }
            else:
                return {
                    "status": step["status"],
                    "step_id": step_id,
                    "message": f"Step is in {step['status']} state, no clarification needed."
                }
                
        except Exception as e:
            logger.error(f"Error getting clarification: {e}")
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
    
    # Add endpoint to extract parameters from user input
    @router.post("/extract-params")
    async def extract_parameters(request: Dict[str, Any]):
        """Use AI to extract parameters from user input."""
        try:
            step = request.get("step")
            user_input = request.get("userInput")
            
            if not step or not user_input:
                raise HTTPException(status_code=400, detail="Missing required fields in request")
            
            # Get parameters needed for this step
            parameters = {}
            
            # Use LLM to extract parameters from user input
            import os
            from gemini import GeminiChatbot
            
            chatbot = GeminiChatbot()
            
            # Create prompt for parameter extraction
            param_names = [p.get("name") for p in step.get("missing_params", [])]
            prompt = f"""
            Extract the following parameters from this user input: {', '.join(param_names)}
            
            User input: {user_input}
            
            Return ONLY a JSON object with the parameter names as keys and extracted values as values.
            Do not include any explanation or any text outside the JSON.
            """
            
            # Get response from Gemini
            extraction_result = await chatbot.get_response(prompt, [])
            
            # Parse the result as JSON
            import json
            try:
                # Try to parse the entire response as JSON
                parameters = json.loads(extraction_result)
            except json.JSONDecodeError:
                # If that fails, try to extract just the JSON part
                import re
                json_pattern = r'({[\s\S]*?})'
                json_match = re.search(json_pattern, extraction_result)
                
                if json_match:
                    try:
                        parameters = json.loads(json_match.group(1))
                    except json.JSONDecodeError:
                        raise HTTPException(status_code=500, detail="Failed to parse parameter extraction result")
                else:
                    raise HTTPException(status_code=500, detail="Failed to extract parameters from AI response")
            
            return {
                "status": "success",
                "parameters": parameters
            }
            
        except Exception as e:
            logger.error(f"Error extracting parameters: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Add the router to the app
    app.include_router(router)
    
    logger.info("Workflow routes initialized")
    
    # This function doesn't need to return anything
    # It just sets up the routes on the app