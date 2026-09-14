from fastapi import APIRouter

from app.tools.health import check_website_health
from app.tools.logs import get_recent_logs
from app.tools.metrics import get_system_metrics


router = APIRouter(
    prefix="/tools",
    tags=["Tools"],
)


@router.get("/health")
def health_tool():
    return check_website_health()


@router.get("/metrics")
def metrics_tool():
    return get_system_metrics()


@router.get("/logs")
def logs_tool():
    return get_recent_logs()