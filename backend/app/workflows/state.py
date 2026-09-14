from dataclasses import dataclass
from typing import TypedDict

from sqlalchemy.orm import Session

from app.schemas.diagnosis import IncidentDiagnosis
from app.schemas.remediation import RemediationProposal

@dataclass
class IncidentWorkflowContext:
    db: Session


class IncidentWorkflowState(TypedDict, total=False):

    incident_description: str

    evidence: list[dict]

    retrieved_knowledge: list[dict]

    diagnosis: IncidentDiagnosis

    remediation: RemediationProposal

    error: str