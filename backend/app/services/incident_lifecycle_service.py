from uuid import UUID

from sqlalchemy.orm import Session

from app.models.enums import (
    IncidentPhase,
    IncidentStatus,
    VerificationStatus,
)
from app.models.incident import Incident


class InvalidTransitionError(Exception):
    pass


ALLOWED_TRANSITIONS = {
    IncidentPhase.INTAKE: {
        IncidentPhase.INVESTIGATING,
    },

    IncidentPhase.INVESTIGATING: {
        IncidentPhase.DIAGNOSING,
    },

    IncidentPhase.DIAGNOSING: {
        IncidentPhase.REMEDIATION_PENDING,
    },

    IncidentPhase.REMEDIATION_PENDING: {
        IncidentPhase.REMEDIATING,
    },

    IncidentPhase.REMEDIATING: {
        IncidentPhase.VERIFYING,
    },

    IncidentPhase.VERIFYING: {
        IncidentPhase.COMPLETED,
        IncidentPhase.INVESTIGATING,
    },
}

def transition_incident(
    db: Session,
    incident: Incident,
    next_phase: IncidentPhase,
) -> Incident:

    current_phase = IncidentPhase(
        incident.current_phase
    )

    allowed_phases = ALLOWED_TRANSITIONS.get(
        current_phase,
        set(),
    )

    if next_phase not in allowed_phases:
        raise InvalidTransitionError(
            f"Cannot transition incident from "
            f"{current_phase.value} to "
            f"{next_phase.value}"
        )

    incident.current_phase = next_phase.value

    if next_phase == IncidentPhase.INVESTIGATING:
        incident.status = IncidentStatus.IN_PROGRESS.value

    elif next_phase == IncidentPhase.VERIFYING:
        incident.verification_status = (
            VerificationStatus.IN_PROGRESS.value
        )

    elif next_phase == IncidentPhase.COMPLETED:
        incident.status = IncidentStatus.RESOLVED.value
        incident.verification_status = (
            VerificationStatus.PASSED.value
        )

    db.commit()
    db.refresh(incident)

    return incident