TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "check_website_health",
            "description": (
                "Check whether the production website "
                "is healthy and return its HTTP status."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_logs",
            "description": (
                "Retrieve recent application logs from "
                "the production environment."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_system_metrics",
            "description": (
                "Retrieve CPU, memory and database "
                "connection metrics."
            ),
            "parameters": {
                "type": "object",
                "properties": {},
                "required": [],
            },
        },
    },
]