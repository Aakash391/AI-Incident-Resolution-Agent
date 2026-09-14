from fastapi import APIRouter

from app.services.incident_workflow_service import (
    investigate_incident,
)
from app.schemas.agent import (
    IncidentInvestigationRequest,
    IncidentInvestigationResponse,
)
from app.db.dependencies import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

router = APIRouter(
    prefix="/agent",
    tags=["AI Agent"],
)


@router.post(
    "/investigate",
)
def investigate(
    request: IncidentInvestigationRequest,
    db: Session = Depends(get_db),
):
    result = investigate_incident(
        db=db,
        incident_description=request.incident_description,
    )

    print("========== API RESULT ==========")
    print(result)
    print("================================")

    return result