import httpx


PRODUCTION_URL = "http://mock-production:9000"


def get_system_metrics() -> dict:

    response = httpx.get(
        f"{PRODUCTION_URL}/metrics",
        timeout=5,
    )

    response.raise_for_status()

    return response.json()