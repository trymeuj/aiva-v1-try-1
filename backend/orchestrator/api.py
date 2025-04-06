from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import logging
import json
import os

from .orchestrator import Orchestrator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orchestrator_api")

# Load API registry - adjust path as needed
def get_api_registry():
    try:
        api_info_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "api_info")
        if os.path.exists(api_info_path):
            with open(api_info_path, "r") as f:
                return json.load(f)
        else:
            logger.warning(f"API info file not found at {api_info_path}")
            return []
    except Exception as e:
        logger.error(f"Error loading API registry: {e}")
        return []

# Get orchestrator instance
def get_orchestrator():
    api_registry = get_api_registry()
    return Orchestrator(api_registry)

# Create router
router = APIRouter(
    prefix="/orchestrator",
    tags=["orchestrator"],
    responses={404: {"description": "Not found"}},
)

# ----- Pydantic models for request/response validation -----

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

# ----- API Endpoints -----

@router.post("/create-plan", response_model=Dict)
async def create_plan(request: WorkflowRequest, orchestrator: Orchestrator = Depends(get_orchestrator)):
    """
    Create an execution plan from a workflow.
    """
    try:
        # Convert Pydantic model to dict
        workflow_dict = [step.dict() for step in request.workflow]
        
        # Create the execution plan
        plan = orchestrator.create_execution_plan(workflow_dict, request.session_id)
        return plan
    except Exception as e:
        logger.error(f"Error creating plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/execute-step", response_model=Dict)
async def execute_step(request: StepExecutionRequest, orchestrator: Orchestrator = Depends(get_orchestrator)):
    """
    Execute a single step in the workflow.
    """
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

@router.post("/provide-clarification", response_model=Dict)
async def provide_clarification(request: ClarificationRequest, orchestrator: Orchestrator = Depends(get_orchestrator)):
    """
    Provide user responses to clarification questions.
    """
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

# Additional utility endpoint
@router.get("/api-registry", response_model=List)
async def get_api_registry_endpoint():
    """
    Get the API registry.
    """
    return get_api_registry()