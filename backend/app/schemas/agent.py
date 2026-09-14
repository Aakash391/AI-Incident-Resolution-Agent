from pydantic import BaseModel, Field
from app.schemas.diagnosis import IncidentDiagnosis
from app.schemas.remediation import RemediationProposal

class IncidentInvestigationResponse(BaseModel):
    diagnosis: IncidentDiagnosis
    remediation: RemediationProposal

class IncidentInvestigationRequest(BaseModel):

    incident_description: str = Field(
        min_length=1,
        description="Description of the production incident.",
    )