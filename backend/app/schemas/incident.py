from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    IncidentPhase,
    IncidentStatus,
    VerificationStatus,
    IncidentSeverity
)


class IncidentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    severity: IncidentSeverity = IncidentSeverity.MEDIUM


class IncidentUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    description: str | None = Field(
        default=None,
        min_length=1,
    )

    status: IncidentStatus | None = None
    severity: IncidentSeverity | None = None


class IncidentResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: UUID
    title: str
    description: str

    status: IncidentStatus
    severity: str

    current_phase: IncidentPhase

    root_cause: str | None
    resolution: str | None

    verification_status: VerificationStatus

    created_at: datetime
    updated_at: datetime
