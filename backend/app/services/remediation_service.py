from sqlalchemy.orm import Session

from app.repositories.remediation_repository import (
    find_approved_remediation,
)
from app.schemas.remediation import (
    RemediationProposal,
    RemediationSource,
    RemediationStatus,
)
from app.ai.agent import generate_playbook

from sqlalchemy.orm import Session

from app.schemas.remediation import (
    RemediationProposal,
)
from app.schemas.remediation import (
    RemediationSource,
    RemediationStatus,
)
from app.services.playbook_service import (
    get_rag_playbook_path,
)
from app.ai.agent import generate_playbook


def find_remediation(
    db: Session,
    remediation_action: str,
    risk_level: str,
    diagnosis: str,
) -> RemediationProposal:

    remediation = find_approved_remediation(
        db=db,
        remediation_action=remediation_action,
    )

    if remediation is not None:

        if not remediation.playbook_filename:
            raise ValueError(
                "RAG remediation exists but does not "
                "have a playbook filename."
            )

        get_rag_playbook_path(
            remediation.playbook_filename
        )

        return RemediationProposal(
            id=str(remediation.id),
            remediation_action=(
                remediation.remediation_action
            ),
            source=RemediationSource.RAG,
            playbook=remediation.playbook,
            playbook_filename=(
                remediation.playbook_filename
            ),
            target_group=remediation.target_group,
            risk_level=remediation.risk_level,
            status=RemediationStatus.APPROVAL_REQUIRED,
            requires_approval=True,
        )

    generated = generate_playbook(
        remediation_action=remediation_action,
        diagnosis=diagnosis,
    )

    return RemediationProposal(
        id=None,
        remediation_action=remediation_action,
        source=RemediationSource.GENERATED,
        playbook=generated.playbook,
        playbook_filename=generated.filename,
        target_group="linux_servers",
        risk_level=risk_level,
        status=RemediationStatus.APPROVAL_REQUIRED,
        requires_approval=True,
    )