def mock_health_data() -> dict:
    return {
        "healthy": True,
        "status_code": 200,
    }


def mock_logs_data() -> dict:
    return {
        "logs": [
            "CPU HIGH"
        ]
    }


def mock_metrics_data() -> dict:
    return {
        "cpu_usage": 85.0,
        "memory_usage": 42.0,
        "database_connections": 20,
    }