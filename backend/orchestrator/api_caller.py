import logging
import httpx
import json
from typing import Dict, Any, Optional
import inspect
import importlib
import os

logger = logging.getLogger("api_caller")

class ApiCaller:
    """
    Utility for making API calls to various services.
    This handles the actual communication with external APIs.
    """
    
    def __init__(self):
        self.clients = {}
        self._load_api_clients()
    
    def _load_api_clients(self):
        """
        Load available API clients from your existing modules.
        This makes your existing API integrations available to the orchestrator.
        """
        try:
            # Try to import your existing clients
            from gemini import GeminiChatbot
            self.clients["GeminiChatbot"] = GeminiChatbot()
            
            from google_search import GoogleSearchClient
            self.clients["GoogleSearchClient"] = GoogleSearchClient()
            
            from youcom_api import YouComClient
            self.clients["YouComClient"] = YouComClient()
            
            # You can add more clients here as needed
            
            logger.info(f"Loaded API clients: {list(self.clients.keys())}")
        except ImportError as e:
            logger.warning(f"Could not import all API clients: {e}")
    
    async def call_http_api(self, url: str, method: str = "GET", 
                     headers: Dict = None, params: Dict = None, 
                     data: Dict = None, timeout: int = 30) -> Dict:
        """
        Make an HTTP API call.
        
        Args:
            url: API endpoint URL
            method: HTTP method (GET, POST, etc.)
            headers: HTTP headers
            params: Query parameters
            data: Request body for POST/PUT
            timeout: Request timeout in seconds
            
        Returns:
            Response data as dictionary
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method=method,
                    url=url,
                    headers=headers,
                    params=params,
                    json=data if data and method in ["POST", "PUT", "PATCH"] else None,
                    timeout=timeout
                )
                
                response.raise_for_status()
                
                # Try to parse as JSON, fallback to text
                try:
                    return response.json()
                except json.JSONDecodeError:
                    return {"text": response.text}
                    
        except httpx.RequestError as e:
            logger.error(f"Request error for {url}: {e}")
            raise Exception(f"API request failed: {str(e)}")
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error {e.response.status_code} for {url}: {e}")
            
            # Try to get error details from response
            error_detail = str(e)
            try:
                error_json = e.response.json()
                if isinstance(error_json, dict):
                    error_detail = error_json.get("error", error_json)
            except:
                error_detail = e.response.text or str(e)
                
            raise Exception(f"API returned error {e.response.status_code}: {error_detail}")
    
    async def call_client_method(self, client_name: str, method_name: str, **kwargs) -> Any:
        """
        Call a method on one of the loaded API clients.
        
        Args:
            client_name: Name of the client (e.g., "YouComClient")
            method_name: Name of the method to call
            **kwargs: Arguments to pass to the method
            
        Returns:
            Result from the client method
        """
        if client_name not in self.clients:
            raise ValueError(f"API client '{client_name}' not found")
            
        client = self.clients[client_name]
        
        if not hasattr(client, method_name):
            raise ValueError(f"Method '{method_name}' not found in client '{client_name}'")
            
        method = getattr(client, method_name)
        
        # Check if method is async
        if inspect.iscoroutinefunction(method):
            return await method(**kwargs)
        else:
            return method(**kwargs)
    
    async def execute_api(self, software: str, api_name: str, parameters: Dict) -> Dict:
        """
        Execute an API call based on registry information.
        
        Args:
            software: Software name from API registry
            api_name: API name from registry
            parameters: API parameters
            
        Returns:
            API response
        """
        # This is where you'd map the software/API names to actual implementation
        # For now, we'll use a simple mapping approach that you can expand
        
        logger.info(f"Executing API: {software}/{api_name}")
        logger.info(f"Parameters: {parameters}")
        
        # Example mapping logic
        if software == "YouCom" and api_name == "SmartSearch":
            return await self.call_client_method(
                "YouComClient", 
                "smart_search", 
                query=parameters.get("query", ""),
                instructions=parameters.get("instructions", None)
            )
            
        elif software == "GoogleSearch" and api_name == "Search":
            return await self.call_client_method(
                "GoogleSearchClient",
                "search",
                query=parameters.get("query", ""),
                num_results=parameters.get("num_results", 5)
            )
            
        elif software == "Gemini" and api_name == "Chat":
            return await self.call_client_method(
                "GeminiChatbot",
                "get_response",
                user_message=parameters.get("message", ""),
                history=parameters.get("history", [])
            )
            
        # For custom HTTP APIs
        elif "http_api_url" in parameters:
            return await self.call_http_api(
                url=parameters["http_api_url"],
                method=parameters.get("http_method", "GET"),
                headers=parameters.get("http_headers", {}),
                params=parameters.get("http_params", {}),
                data=parameters.get("http_data", {})
            )
            
        else:
            # For mock/demonstration purposes
            # In a real implementation, you would remove this and ensure
            # all APIs are properly mapped
            return self._mock_api_call(software, api_name, parameters)
    
    def _mock_api_call(self, software: str, api_name: str, parameters: Dict) -> Dict:
        """
        Provide mock responses for demonstration purposes.
        """
        # Mock implementations for common APIs
        if software == "FlightBooking" and api_name == "SearchFlights":
            return {
                "flights": [
                    {
                        "id": "F123",
                        "airline": "Example Air",
                        "departure": "2025-04-12T08:00:00Z",
                        "arrival": "2025-04-12T10:30:00Z",
                        "price": 299.99
                    },
                    {
                        "id": "F456",
                        "airline": "Sample Airlines",
                        "departure": "2025-04-12T10:15:00Z",
                        "arrival": "2025-04-12T12:45:00Z",
                        "price": 329.99
                    }
                ]
            }
        elif software == "FlightBooking" and api_name == "BookFlight":
            return {
                "bookingId": "B12345",
                "flightId": parameters.get("flightId", "unknown"),
                "status": "confirmed",
                "departureTime": "2025-04-12T08:00:00Z",
                "arrivalTime": "2025-04-12T10:30:00Z"
            }
        elif software == "Calendar" and api_name == "AddEvent":
            return {
                "eventId": "E67890",
                "title": parameters.get("title", "Event"),
                "startTime": parameters.get("startTime", "unknown"),
                "endTime": parameters.get("endTime", "unknown"),
                "status": "added"
            }
        
        # Default mock response
        return {
            "message": f"Successfully executed {software}/{api_name} (mock)",
            "parameters": parameters
        }