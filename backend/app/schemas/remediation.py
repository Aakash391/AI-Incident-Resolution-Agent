from enum import Enum

from pydantic import BaseModel


class RemediationSource(str, Enum):
    RAG = "rag"
    GENERATED = "generated"


class RemediationStatus(str, Enum):
    FOUND = "found"
    GENERATION_REQUIRED = "generation_required"
    APPROVAL_REQUIRED = "approval_required"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"
    FAILED = "failed"


class RemediationProposal(BaseModel):
    id : str | None = None

    remediation_action: str

    source: RemediationSource

    playbook: str | None = None

    target_group: str | None = None

    risk_level: str

    status: RemediationStatus

    requires_approval: bool = True