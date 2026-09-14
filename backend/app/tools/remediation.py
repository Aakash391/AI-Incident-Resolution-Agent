import httpx


PRODUCTION_URL = "http://mock-production:9000"


def restart_application() -> dict:

    response = httpx.post(
        f"{PRODUCTION_URL}/restart",
        timeout=10,
    )

    response.raise_for_status()

    return response.json()