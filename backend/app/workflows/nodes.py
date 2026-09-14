from app.ai.agent import (
    gather_incident_evidence,
    generate_diagnosis,
)

from app.workflows.state import IncidentWorkflowState
from sqlalchemy.orm import Session

from app.services.rag_service import (
    retrieve_relevant_knowledge,
)
from app.services.remediation_service import (
    find_remediation
)
from langgraph.runtime import Runtime

from app.workflows.state import (
    IncidentWorkflowContext,
    IncidentWorkflowState,
)

def investigation_node(
    state: IncidentWorkflowState,
) -> IncidentWorkflowState:

    # print(">>> Investigation Node")

    evidence = gather_incident_evidence(
        state["incident_description"]
    )

    return {
        **state,
        "evidence": evidence,
    }

def diagnosis_node(
    state: IncidentWorkflowState,
) -> IncidentWorkflowState:

    # print(">>> Diagnosis Node")

    diagnosis = generate_diagnosis(
        incident_description=state[
            "incident_description"
        ],
        evidence=state["evidence"],
        retrieved_knowledge=state.get(
            "retrieved_knowledge",
            [],
        ),
    )

    return {
        **state,
        "diagnosis": diagnosis,
    }

def intake_node(
    state: IncidentWorkflowState,
) -> IncidentWorkflowState:

    # print(">>> Intake Node")

    return {
        **state,
    }

def rag_node(
    state: IncidentWorkflowState,
    runtime: Runtime[IncidentWorkflowContext],
) -> IncidentWorkflowState:

    knowledge = retrieve_relevant_knowledge(
        db=runtime.context.db,
        query=state["incident_description"],
    )

    return {
        **state,
        "retrieved_knowledge": knowledge,
    }

from app.schemas.remediation import RemediationProposal
from app.services.remediation_service import find_remediation


def remediation_node(
    state: IncidentWorkflowState,
    runtime: Runtime[IncidentWorkflowContext],
) -> IncidentWorkflowState:

    diagnosis = state["diagnosis"]

    remediation = find_remediation(
        db=runtime.context.db,
        remediation_action=diagnosis.remediation_action,
        risk_level=diagnosis.risk_level,
        diagnosis=diagnosis.model_dump_json(),
    )

    return {
        **state,
        "remediation": remediation,
    }