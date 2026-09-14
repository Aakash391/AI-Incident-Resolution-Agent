import httpx


PRODUCTION_URL = "http://mock-production:9000"


def get_recent_logs() -> dict:

    response = httpx.get(
        f"{PRODUCTION_URL}/logs",
        timeout=5,
    )

    response.raise_for_status()

    return response.json()