from sqlalchemy.orm import Session

from app.schemas.diagnosis import IncidentDiagnosis
from app.workflows.graph import incident_graph
from app.workflows.state import IncidentWorkflowContext
from app.schemas.agent import IncidentInvestigationResponse

def investigate_incident(
    db: Session,
    incident_description: str,
) -> IncidentInvestigationResponse:

    initial_state = {
        "incident_description": incident_description,
    }

    final_state = incident_graph.invoke(
        initial_state,
        context=IncidentWorkflowContext(
            db=db,
        ),
    )

    print("FINAL STATE:", final_state)
    
    return IncidentInvestigationResponse(
        diagnosis=final_state["diagnosis"],
        remediation=final_state["remediation"],
    )
    # return final_state["diagnosis"]