import json
import logging
from typing import Dict, List, Any, Optional, Union
import asyncio
# Add to the imports at the top of orchestrator.py
from datetime import datetime
import traceback
from datetime import datetime


# You'll need to adjust this import based on how your Gemini integration is structured
from gemini import GeminiChatbot

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orchestrator")

class Orchestrator:
    """
    API Orchestrator that handles the execution of API workflows
    identified by the intent extractor.
    """
    
    def __init__(self, api_registry: List[Dict]):
        """
        Initialize the orchestrator with the API registry.
        
        Args:
            api_registry: List of API configurations
        """
        self.api_registry = api_registry
        self.execution_contexts = {}  # Stores execution state for multiple sessions
    
    def create_execution_plan(self, workflow: List[Dict], session_id: str = None) -> Dict:
        """
        Create a detailed execution plan from a workflow.
        
        Args:
            workflow: List of workflow steps from intent extractor
            session_id: Optional session identifier
            
        Returns:
            Dict containing the enriched plan
        """
        if not session_id:
            session_id = f"session_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
            
        steps = []
        
        for idx, step in enumerate(workflow):
            # Get detailed API information
            api_info = self._get_api_info(step["software"], step["api"]["name"])
            if not api_info:
                logger.warning(f"API not found: {step['software']}/{step['api']['name']}")
                continue
                
            # Create enriched step information
            step_id = f"step_{idx+1}"
            enriched_step = {
                "id": step_id,
                "software": step["software"],
                "api": {
                    "name": step["api"]["name"],
                    "description": step["api"]["description"]
                },
                "parameters": step.get("parameters", {}),
                "reasoning": step.get("reasoning", "No reasoning provided"),
                "status": "pending",
                "required_parameters": [
                    param for param in api_info["parameters"] 
                    if param.get("required", False)
                ]
            }
            
            steps.append(enriched_step)
        
        # Create execution context
        self.execution_contexts[session_id] = {
            "workflow": workflow,
            "plan": steps,
            "results": {},
            "user_context": {},
            "current_step_index": 0
        }
        
        return {
            "session_id": session_id,
            "plan": steps
        }
    
    async def execute_step(self, session_id: str, step_id: str = None, 
                    additional_context: Dict = None) -> Dict:
        """
        Execute a specific step in the workflow.
        
        Args:
            session_id: Session identifier
            step_id: Step identifier (if None, executes the current step)
            additional_context: Additional context provided by the user
            
        Returns:
            Dict containing execution results and updated plan
        """
        # Validate session
        if session_id not in self.execution_contexts:
            return {"error": "Session not found"}
            
        context = self.execution_contexts[session_id]
        
        # Find the step to execute
        step_index = None
        if step_id:
            for idx, step in enumerate(context["plan"]):
                if step["id"] == step_id:
                    step_index = idx
                    break
            if step_index is None:
                return {"error": f"Step {step_id} not found"}
        else:
            step_index = context["current_step_index"]
            if step_index >= len(context["plan"]):
                return {"status": "completed", "message": "All steps completed"}
        
        # Get the step
        step = context["plan"][step_index]
        step_id = step["id"]
        
        # Update step status
        step["status"] = "in_progress"
        
        # Apply additional context if provided
        if additional_context:
            context["user_context"][step_id] = additional_context
            # You could use LLM here to extract structured information from freeform context
            # For now, we'll just update parameters directly if they're provided
            if "parameters" in additional_context:
                step["parameters"].update(additional_context["parameters"])
        
        # Resolve parameters (replace references with actual values)
        try:
            resolved_params = await self._resolve_parameters(step, context)
        except Exception as e:
            logger.error(f"Error resolving parameters: {e}")
            step["status"] = "failed"
            step["error"] = f"Parameter resolution error: {str(e)}"
            return {
                "status": "error",
                "step_id": step_id,
                "error": str(e),
                "plan": context["plan"]
            }
        
        # Check for missing required parameters
        missing_params = self._check_missing_parameters(resolved_params, step)
        if missing_params:
            # Generate clarification questions
            questions = await self._generate_clarification_questions(missing_params, step)
            return {
                "status": "needs_clarification",
                "step_id": step_id,
                "questions": questions,
                "missing_params": missing_params,
                "plan": context["plan"]
            }
        
        # Execute the API call
        try:
            result = await self._execute_api_call(
                step["software"], 
                step["api"]["name"], 
                resolved_params
            )
            
            # Store the result in the execution context
            context["results"][step_id] = {
                "status": "completed",
                "result": result
            }
            
            # Update step status
            step["status"] = "completed"
            
            # Move to the next step
            context["current_step_index"] = step_index + 1
            
            return {
                "status": "completed",
                "step_id": step_id,
                "result": result,
                "plan": context["plan"],
                "next_step_id": context["plan"][context["current_step_index"]]["id"] 
                    if context["current_step_index"] < len(context["plan"]) else None
            }
            
        except Exception as e:
            logger.error(f"Error executing API: {e}")
            logger.error(traceback.format_exc())
            
            # Update step status
            step["status"] = "failed"
            step["error"] = str(e)
            
            # Generate suggestions for error
            suggestion = await self._generate_error_suggestion(e, step)
            
            return {
                "status": "error",
                "step_id": step_id,
                "error": str(e),
                "suggestion": suggestion,
                "plan": context["plan"]
            }
    
    async def provide_clarification(self, session_id: str, step_id: str, 
                             responses: Dict) -> Dict:
        """
        Process user responses to clarification questions.
        
        Args:
            session_id: Session identifier
            step_id: Step identifier
            responses: User responses to clarification questions
            
        Returns:
            Dict containing updated execution results
        """
        # Validate session
        if session_id not in self.execution_contexts:
            return {"error": "Session not found"}
            
        context = self.execution_contexts[session_id]
        
        # Find the step
        step = None
        for s in context["plan"]:
            if s["id"] == step_id:
                step = s
                break
                
        if not step:
            return {"error": f"Step {step_id} not found"}
        
        # Update parameters with responses
        if not "parameters" in step:
            step["parameters"] = {}
            
        step["parameters"].update(responses)
        
        # Re-execute the step
        return await self.execute_step(session_id, step_id)
    
    def _get_api_info(self, software_name: str, api_name: str) -> Optional[Dict]:
        """Get detailed API information from the registry."""
        for software in self.api_registry:
            if software["name"] == software_name:
                for api in software["apis"]:
                    if api["name"] == api_name:
                        return api
        return None
    
    async def _resolve_parameters(self, step: Dict, context: Dict) -> Dict:
        """Resolve parameter references from the execution context."""
        resolved = {}
        
        for key, value in step["parameters"].items():
            if isinstance(value, str) and value.startswith("{") and value.endswith("}"):
                # This is a reference to a previous step result
                path = value[1:-1].split(".")
                current = context
                
                try:
                    for segment in path:
                        # Handle array indexing
                        if "[" in segment and segment.endswith("]"):
                            array_name, index_str = segment.split("[")
                            index = int(index_str[:-1])
                            current = current[array_name][index]
                        else:
                            current = current[segment]
                    
                    resolved[key] = current
                except (KeyError, IndexError, TypeError) as e:
                    raise ValueError(f"Could not resolve parameter reference '{value}': {str(e)}")
            else:
                resolved[key] = value
        
        return resolved
    
    def _check_missing_parameters(self, parameters: Dict, step: Dict) -> List[Dict]:
        """Identify missing required parameters."""
        missing = []
        
        for param in step["required_parameters"]:
            param_name = param["name"]
            if param_name not in parameters or parameters[param_name] is None:
                missing.append(param)
        
        return missing
    
    async def _generate_clarification_questions(self, missing_params: List[Dict], 
                                         step: Dict) -> str:
        """Generate natural language questions for missing parameters."""
        prompt = f"""
I need to execute the API "{step['api']['name']}" ({step['api']['description']}), but I'm missing some information.

I need the user to provide values for the following parameters:
{json.dumps([{"name": p["name"], "description": p.get("description", p["name"]), "type": p.get("type", "string")} for p in missing_params], indent=2)}

Generate 1-3 natural, conversational questions to ask the user for this information.
Be concise but friendly. Don't include any preamble or conclusion, just the questions.
        """
        
        try:
            # use existing chatbot
            if not hasattr(self, '_chatbot'):
                self._chatbot = GeminiChatbot()
            response = await self._chatbot.get_response(prompt, [])
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating clarification questions: {e}")
            # Fallback to basic questions
            return "\n".join([
                f"Please provide the {p['name']} " +
                f"({p.get('description', '')})" for p in missing_params
            ])
    
    async def _generate_error_suggestion(self, error: Exception, step: Dict) -> str:
        """Generate helpful suggestions for error recovery."""
        error_msg = str(error)
        
        prompt = f"""
I encountered an error while trying to execute the API "{step['api']['name']}" ({step['api']['description']}):

Error: {error_msg}

Based on this error, suggest what the user should do next to fix the issue.
Keep your response concise and helpful (1-3 sentences maximum).
        """
        
        try:
                # Call the Gemini model
                # Use your existing GeminiChatbot
            if not hasattr(self, '_chatbot'):
                self._chatbot = GeminiChatbot()
            response = await self._chatbot.get_response(prompt, [])
            return response.strip()
        except Exception as e:
            logger.error(f"Error generating error suggestion: {e}")
            return f"There was an error: {error_msg}. Please check your parameters and try again."
    
    async def _execute_api_call(self, software: str, api_name: str, 
                     parameters: Dict) -> Dict:
        """
         Execute an API call using the ApiCaller.
        """
        from .api_caller import ApiCaller
    
    # Lazy-load the API caller
        if not hasattr(self, '_api_caller'):
            self._api_caller = ApiCaller()
    
    # Execute the API call
        return await self._api_caller.execute_api(software, api_name, parameters)