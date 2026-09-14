from langgraph.graph import END, START, StateGraph

from app.workflows.nodes import (
    diagnosis_node,
    intake_node,
    investigation_node,
    rag_node,
    remediation_node,
)

from app.workflows.state import IncidentWorkflowState
from app.workflows.state import (
    IncidentWorkflowContext,
    IncidentWorkflowState,
)
def build_incident_graph():

    graph = StateGraph(
    IncidentWorkflowState,
    context_schema=IncidentWorkflowContext,
)

    graph.add_node(
        "intake",
        intake_node,
    )

    graph.add_node(
        "investigation",
        investigation_node,
    )

    graph.add_node(
        "diagnosis",
        diagnosis_node,
    )

    graph.add_node(
        "rag",
        rag_node,
    )

    graph.add_node(
        "remediation",
        remediation_node,
    )
    
    graph.add_edge(
        START,
        "intake",
    )

    graph.add_edge(
        "intake",
        "investigation",
    )

    graph.add_edge(
        "investigation",
        "rag",
    )

    graph.add_edge(
        "rag",
        "diagnosis",
    )

    graph.add_edge(
        "diagnosis",
        "remediation",
    )

    graph.add_edge(
        "remediation",
        END,
    )


    return graph.compile()

incident_graph = build_incident_graph()