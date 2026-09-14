from pydantic import BaseModel, Field, field_validator

from app.models.enums import IncidentSeverity, RiskLevel


class Evidence(BaseModel):
    source: str
    observation: str


class IncidentDiagnosis(BaseModel):
    summary: str

    root_cause: str

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )

    severity: IncidentSeverity

    affected_component: str

    evidence: list[Evidence] = Field(
        min_length=1,
        max_length=10,
    )

    remediation_action: str
    risk_level: RiskLevel

    @field_validator("severity", mode="before")
    @classmethod
    def normalize_severity(cls, value):
        if isinstance(value, str):
            return value.lower()

        return value

    @field_validator("risk_level", mode="before")
    @classmethod
    def normalize_risk_level(cls, value):
        if isinstance(value, str):
            return value.lower()

        return value