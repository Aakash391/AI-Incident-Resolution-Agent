import httpx


PRODUCTION_URL = "http://mock-production:9000"


def check_website_health() -> dict:
    """
    Check whether the production website is healthy.

    Returns the current application health state
    and HTTP status code.
    """

    response = httpx.get(
        f"{PRODUCTION_URL}/health",
        timeout=5,
    )

    response.raise_for_status()

    return response.json()