"""
API Intention Extractor using Google's Gemini API

Uses the gemini-2.0-flash model for API intention extraction
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from fastapi import Request

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("intent_extractor")

# Path to API information file
API_INFO_PATH = os.path.join(os.path.dirname(__file__), 'api_info')

async def load_api_info():
    """Read and parse API information from file"""
    try:
        with open(API_INFO_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as error:
        logger.error(f"Error loading API info from {API_INFO_PATH}: {error}")
        return []

def create_api_reference_string(api_ref_data):
    """Create a compact string representation of the API reference data"""
    result = ''
    
    for software in api_ref_data:
        result += f"SOFTWARE: {software['name']} - {software['description']}\n"
        
        for api in software['apis']:
            result += f"  API: {api['name']} - {api['description']}\n"
            result += f"  Parameters:\n"
            
            for param in api['parameters']:
                required_text = ', required' if param.get('required', False) else ''
                result += f"    - {param['name']} ({param.get('type', 'string')}{required_text}): {param['description']}\n"
            
            result += '\n'
    
    return result

async def extract_api_intentions(user_prompt, api_ref_data, api_key):
    """Extract API intentions using Gemini"""
    # Initialize Gemini client
    genai.configure(api_key=api_key)
    
    # Create a compact representation of the API reference data
    api_ref_string = create_api_reference_string(api_ref_data)
    
    try:
        # Use the gemini-2.0-flash model
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={"temperature": 0.1}
        )
        
        # Create a prompt for Gemini
        prompt = f"""
I'll analyze a user's request to determine if they want to use an API, which APIs they need, and what parameter values they've specified.

API REFERENCE:
{api_ref_string}

USER REQUEST: "{user_prompt}"

Based on the user request and available APIs, I'll:
1. Determine if the user wants to use an API
2. Identify which API(s) they need
3. Extract parameter values they've specified
4. Provide reasoning for my choices

Respond with JSON only, in this format:
{{
  "hasAgentIntention": true|false,
  "reasoning": "Brief explanation why this is or isn't an API request",
  "workflow": [
    {{
      "software": "software name",
      "api": {{
        "name": "API name",
        "description": "API description"
      }},
      "parameters": {{
        "param1": "value1",
        "param2": "value2"
      }},
      "reasoning": "Why I selected this API"
    }}
  ]
}}

If there's no API intention, "workflow" should be an empty array.
If the user wants to perform multiple operations in sequence, include all APIs in the "workflow" array in the correct order.
"""
        
        # Generate content with Gemini
        response = model.generate_content(prompt)
        text = response.text
        
        logger.info(f"Raw response: {text}")
        
        # Parse the JSON from the response
        try:
            # Try to parse as direct JSON
            return json.loads(text)
        except json.JSONDecodeError:
            # If direct parsing fails, try to extract JSON from the text
            import re
            json_match = re.search(r'({.*})', text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(1))
            else:
                raise ValueError("Could not extract valid JSON from the model response")
    except Exception as error:
        logger.error(f'Error calling Gemini API: {error}')
        return {
            "hasAgentIntention": False,
            "reasoning": f"Error calling LLM service: {str(error)}",
            "workflow": []
        }

# FastAPI routes (to be used in the main.py file)
async def setup_intent_extractor_routes(app):
    @app.post("/extract")
    async def extract_intent(request: Request):
        try:
            body = await request.json()
            user_prompt = body.get("userPrompt")
            
            if not user_prompt:
                return {"error": "Missing 'userPrompt' in request body"}
            
            # Get the API key from environment variable or request header
            api_key = os.environ.get("GOOGLE_API_KEY") or request.headers.get("x-google-api-key")
            
            if not api_key:
                return {"error": "Google API key not provided. Set GOOGLE_API_KEY environment variable or include x-google-api-key header."}
            
            # Load API information from file
            api_ref_data = await load_api_info()
            
            if not api_ref_data:
                return {"error": "Could not load API information from file. Please make sure 'api_info' exists and contains valid JSON."}
            
            # Process the user prompt
            result = await extract_api_intentions(user_prompt, api_ref_data, api_key)
            return result
        except Exception as error:
            logger.error(f'Error processing prompt: {error}')
            return {"error": str(error)}

    @app.get("/api-reference")
    async def get_api_reference():
        try:
            api_ref_data = await load_api_info()
            return api_ref_data
        except Exception as error:
            return {"error": str(error)}