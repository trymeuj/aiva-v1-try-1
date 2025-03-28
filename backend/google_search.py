import os
import json
import aiohttp
from dotenv import load_dotenv
from typing import List, Dict, Any, Optional

# Load environment variables
load_dotenv()

# Google Custom Search API configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")

class GoogleSearchClient:
    def __init__(self):
        self.api_key = GOOGLE_API_KEY
        self.cse_id = GOOGLE_CSE_ID
        self.base_url = "https://www.googleapis.com/customsearch/v1"
        
        if not self.api_key or not self.cse_id:
            raise ValueError("Google API Key and CSE ID must be set in environment variables")
    
    async def search(self, query: str, num_results: int = 5) -> Dict[str, Any]:
        """
        Perform a Google search query and return the results.
        
        Args:
            query: The search query string
            num_results: Number of results to return (max 10)
            
        Returns:
            A dictionary containing search results
        """
        params = {
            "key": self.api_key,
            "cx": self.cse_id,
            "q": query,
            "num": min(num_results, 10)  # Google CSE API allows max 10 results per request
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.base_url, params=params) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise Exception(f"HTTP Error {response.status}: {error_text}")
                    
                    return await response.json()
        except aiohttp.ClientError as e:
            raise Exception(f"Request Error: {str(e)}")

    async def format_search_results(self, query: str, num_results: int = 5) -> str:
        """
        Perform a search and format the results in a human-readable format.
        
        Args:
            query: The search query string
            num_results: Number of results to return
            
        Returns:
            A formatted string with search results
        """
        try:
            search_data = await self.search(query, num_results)
            
            if "items" not in search_data or not search_data["items"]:
                return f"No results found for query: '{query}'"
            
            formatted_results = [f"## Search Results for: '{query}'\n"]
            
            for i, item in enumerate(search_data["items"], 1):
                title = item.get("title", "No title")
                link = item.get("link", "No link")
                snippet = item.get("snippet", "No description").replace("\n", " ")
                
                result = f"### {i}. {title}\n"
                result += f"**Link**: {link}\n"
                result += f"**Description**: {snippet}\n\n"
                
                formatted_results.append(result)
            
            return "\n".join(formatted_results)
        
        except Exception as e:
            return f"Error performing search: {str(e)}"