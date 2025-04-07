"""
Utility functions for the AIVA backend
"""
from datetime import datetime
import hashlib
from typing import List, Dict, Optional

def generate_session_id(messages):
    """Generate a consistent session ID from conversation messages"""
    if not messages:
        return f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Use the first few messages to create a consistent hash
    first_messages = []
    for msg in messages[:min(3, len(messages))]:
        if isinstance(msg, dict) and "content" in msg:
            first_messages.append(msg["content"])
        elif hasattr(msg, "content"):
            first_messages.append(msg.content)
    
    hash_input = "".join(first_messages)
    return hashlib.md5(hash_input.encode()).hexdigest()

def format_action_for_confirmation(workflow):
    """Format the workflow actions into a human-readable confirmation message"""
    if not workflow or len(workflow) == 0:
        return "perform this action"
    
    # Format the first action
    action = workflow[0]
    software = action.get("software", "")
    api_name = action.get("api", {}).get("name", "")
    api_desc = action.get("api", {}).get("description", "")
    
    if software == "gmail" and api_name == "send_email":
        params = action.get("parameters", {})
        to = params.get("to", "recipient")
        subject = params.get("subject", "")
        subject_text = f'with the subject "{subject}"' if subject else ""
        return f"send an email to {to} {subject_text}"
    
    elif software == "calendar" and api_name == "create_event":
        params = action.get("parameters", {})
        summary = params.get("summary", "an event")
        start = params.get("start", "")
        if start:
            try:
                # Convert ISO format to readable date
                from datetime import datetime
                date_obj = datetime.fromisoformat(start.replace('Z', '+00:00'))
                date_text = date_obj.strftime("%B %d, %Y at %I:%M %p")
                return f"create a calendar event for '{summary}' on {date_text}"
            except:
                return f"create a calendar event for '{summary}'"
        else:
            return f"create a calendar event for '{summary}'"
    
    elif software == "docs":
        if api_name == "create-doc":
            params = action.get("parameters", {})
            title = params.get("title", "a new document")
            return f"create a Google Doc titled '{title}'"
        elif api_name == "read-doc":
            return "read a Google Doc"
    
    # Generic fallback
    return f"use {software} to {api_desc or api_name}"