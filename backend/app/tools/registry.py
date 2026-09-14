from app.tools.health import check_website_health
from app.tools.logs import get_recent_logs
from app.tools.metrics import get_system_metrics
from app.tools.remediation import restart_application


TOOLS = {
    "check_website_health": check_website_health,
    "get_recent_logs": get_recent_logs,
    "get_system_metrics": get_system_metrics,
    "restart_application": restart_application,
}