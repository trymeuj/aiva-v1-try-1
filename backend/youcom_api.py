import os
import json
import uuid
import aiohttp
from dotenv import load_dotenv
from typing import Dict, Any, Optional, Literal

# Load environment variables
load_dotenv()

# You.com API configuration
YOU_API_KEY = os.getenv("YOU_API_KEY")
YOU_SMART_API_URL = "https://chat-api.you.com/smart"
YOU_RESEARCH_API_URL = "https://chat-api.you.com/research"

class YouComClient:
    def __init__(self):
        self.api_key = YOU_API_KEY
        self.chat_id = str(uuid.uuid4())  # Generate a unique chat ID for the session
        
        if not self.api_key:
            raise ValueError("You.com API Key must be set in environment variables as YOU_API_KEY")
    
    async def smart_search(self, query: str, instructions: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform a smart search using You.com Smart API
        
        Args:
            query: The search query string
            instructions: Optional instructions to tailor the response
            
        Returns:
            A dictionary containing search results with AI-generated answers
        """
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "query": query,
            "chat_id": self.chat_id
        }
        
        # Add instructions if provided
        if instructions:
            payload["instructions"] = instructions
        
        try:
            print(f"Sending request to You.com Smart API: {YOU_SMART_API_URL}")
            print(f"Headers: Content-Type: application/json, X-API-Key: [HIDDEN]")
            print(f"Payload: {payload}")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(YOU_SMART_API_URL, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"Error response from API: {error_text}")
                        raise Exception(f"HTTP Error {response.status}: {error_text}")
                    
                    response_data = await response.json()
                    return response_data
        except aiohttp.ClientError as e:
            raise Exception(f"Request Error: {str(e)}")

    async def research(self, query: str) -> Dict[str, Any]:
        """
        Perform a deep research query using You.com Research API
        
        Args:
            query: The research query string
            
        Returns:
            A dictionary containing research results
        """
        headers = {
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }
        
        payload = {
            "query": query,
            "chat_id": self.chat_id
        }
        
        try:
            print(f"Sending request to You.com Research API: {YOU_RESEARCH_API_URL}")
            print(f"Headers: Content-Type: application/json, X-API-Key: [HIDDEN]")
            print(f"Payload: {payload}")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(YOU_RESEARCH_API_URL, headers=headers, json=payload) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        print(f"Error response from Research API: {error_text}")
                        raise Exception(f"HTTP Error {response.status}: {error_text}")
                    
                    response_data = await response.json()
                    return response_data
        except aiohttp.ClientError as e:
            raise Exception(f"Request Error: {str(e)}")

    async def format_smart_results(self, query: str, instructions: Optional[str] = None) -> str:
        """
        Perform a smart search and format the results in a human-readable format.
        
        Args:
            query: The search query string
            instructions: Optional instructions to tailor the response
            
        Returns:
            A formatted string with search results
        """
        try:
            search_data = await self.smart_search(query, instructions)
            
            if "answer" not in search_data or not search_data["answer"]:
                return f"No results found for query: '{query}'"
            
            # Build the formatted result
            formatted_result = f"## 🔍 Search Results: '{query}'\n\n"
            formatted_result += search_data["answer"]
            
            # Add search results/sources if available
            if "search_results" in search_data and search_data["search_results"]:
                formatted_result += "\n\n### Sources:\n"
                for i, source in enumerate(search_data["search_results"], 1):
                    name = source.get("name", "No title")
                    url = source.get("url", "#")
                    snippet = source.get("snippet", "")
                    
                    formatted_result += f"{i}. [{name}]({url})\n"
                    if snippet:
                        formatted_result += f"   {snippet}\n\n"
            
            return formatted_result
        
        except Exception as e:
            print(f"Error in format_smart_results: {str(e)}")
            return f"Error performing search: {str(e)}"
            
    async def format_research_results(self, query: str, depth: Literal["basic", "comprehensive"] = "comprehensive") -> str:
        """
        Perform a deep research and format the results in a human-readable format.
        
        Args:
            query: The research query string
            depth: Research depth parameter (maintained for compatibility, not used with actual Research API)
            
        Returns:
            A formatted string with research results
        """
        try:
            # Using the dedicated Research API
            research_data = await self.research(query)
            
            if "answer" not in research_data or not research_data["answer"]:
                return f"No research results found for query: '{query}'"
            
            # Format the research results
            formatted_result = f"## 🔬 Deep Research: '{query}'\n\n"
            formatted_result += research_data["answer"]
            
            # Add sources if available
            if "search_results" in research_data and research_data["search_results"]:
                formatted_result += "\n\n### Sources:\n"
                for i, source in enumerate(research_data["search_results"], 1):
                    name = source.get("name", "No title")
                    url = source.get("url", "#")
                    snippet = source.get("snippet", "")
                    
                    formatted_result += f"{i}. [{name}]({url})\n"
                    if snippet:
                        formatted_result += f"   {snippet}\n\n"
            
            return formatted_result
        
        except Exception as e:
            print(f"Error in format_research_results: {str(e)}")
            # Fallback to Smart API with research instructions if Research API fails
            try:
                print("Falling back to Smart API with research instructions...")
                # Create instructions based on the requested depth
                if depth == "comprehensive":
                    instructions = (
                        "Conduct a comprehensive research analysis on this topic. "
                        "Provide in-depth information with academic-level detail, "
                        "including historical context, current developments, and future implications. "
                        "Cite multiple reliable sources and present various perspectives."
                    )
                else:  # basic
                    instructions = (
                        "Provide a basic research overview on this topic. "
                        "Include key facts, main concepts, and important context. "
                        "Format as a concise summary with bullet points for key information."
                    )
                
                # Use smart search with research instructions as fallback
                search_data = await self.smart_search(query, instructions)
                
                if "answer" not in search_data or not search_data["answer"]:
                    return f"No research results found for query: '{query}'"
                
                # Format the results from fallback method
                formatted_result = f"## 🔬 Deep Research (Smart API Fallback): '{query}'\n\n"
                formatted_result += search_data["answer"]
                
                # Add sources if available
                if "search_results" in search_data and search_data["search_results"]:
                    formatted_result += "\n\n### Sources:\n"
                    for i, source in enumerate(search_data["search_results"], 1):
                        name = source.get("name", "No title")
                        url = source.get("url", "#")
                        snippet = source.get("snippet", "")
                        
                        formatted_result += f"{i}. [{name}]({url})\n"
                        if snippet:
                            formatted_result += f"   {snippet}\n\n"
                
                return formatted_result
                
            except Exception as fallback_error:
                return f"Error performing research: {str(e)}. Fallback also failed: {str(fallback_error)}"