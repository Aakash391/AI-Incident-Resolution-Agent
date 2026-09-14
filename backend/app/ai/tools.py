HEALTH_TOOL = {
    "name": "check_website_health",
    "description": (
        "Checks whether the production website is healthy "
        "and returns its current HTTP status."
    ),
    "parameters": {
        "type": "object",
        "properties": {},
    },
}

LOGS_TOOL = {
    "name": "get_recent_logs",
    "description": (
        "Retrieves recent application logs from production "
        "for investigating errors."
    ),
    "parameters": {
        "type": "object",
        "properties": {},
    },
}

METRICS_TOOL = {
    "name": "get_system_metrics",
    "description": (
        "Retrieves current production CPU, memory, and "
        "database connection metrics."
    ),
    "parameters": {
        "type": "object",
        "properties": {},
    },
}

OBSERVATION_TOOLS = [
    HEALTH_TOOL,
    LOGS_TOOL,
    METRICS_TOOL,
]