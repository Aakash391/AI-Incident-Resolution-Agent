from app.tools.health import check_website_health
from app.tools.logs import get_recent_logs
from app.tools.metrics import get_system_metrics
import json

from google.genai import types

from app.ai.client import client
from app.ai.prompts import SYSTEM_PROMPT, DIAGNOSIS_PROMPT
from app.ai.tools import OBSERVATION_TOOLS

from app.tools.mock_data import (
    mock_health_data,
    mock_logs_data,
    mock_metrics_data,
)
from app.schemas.diagnosis import IncidentDiagnosis
from app.schemas.ansible import GeneratedPlaybook
from app.ai.prompts import PLAYBOOK_GENERATION_PROMPT

from app.services.playbook_service import (
    save_generated_playbook,
)

MODEL_NAME = "gemini-3.6-flash"

# AVAILABLE_TOOLS = {
#     "check_website_health": check_website_health,
#     "get_recent_logs": get_recent_logs,
#     "get_system_metrics": get_system_metrics,
# }

AVAILABLE_TOOLS = {
    "check_website_health": mock_health_data,
    "get_recent_logs": mock_logs_data,
    "get_system_metrics": mock_metrics_data,
}

DIAGNOSIS_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {
            "type": "string",
        },
        "root_cause": {
            "type": "string",
        },
        "confidence": {
            "type": "number",
        },
        "severity": {
            "type": "string",
            "enum": [
                "low",
                "medium",
                "high",
                "critical",
            ],
        },
        "affected_component": {
            "type": "string",
        },
        "evidence": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "source": {
                        "type": "string",
                    },
                    "observation": {
                        "type": "string",
                    },
                },
                "required": [
                    "source",
                    "observation",
                ],
            },
        },
        "remediation_action": {
            "type": "string",
        },
        "risk_level": {
            "type": "string",
            "enum": [
                "low",
                "medium",
                "high",
                "critical",
            ],
        },
    },
    "required": [
        "summary",
        "root_cause",
        "confidence",
        "severity",
        "affected_component",
        "evidence",
        "remediation_action",
        "risk_level",
    ],
}

def gather_incident_evidence(
    incident_description: str,
) -> list[dict]:

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(
                    text=incident_description
                )
            ],
        )
    ]

    collected_evidence = []

    while True:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[
                    {
                        "function_declarations":
                        OBSERVATION_TOOLS
                    }
                ],
            ),
        )

        candidate = response.candidates[0]

        function_calls = [
            part.function_call
            for part in candidate.content.parts
            if part.function_call
        ]

        if not function_calls:
            break

        contents.append(candidate.content)

        function_responses = []

        for function_call in function_calls:

            function_name = function_call.name

            function = AVAILABLE_TOOLS.get(
                function_name
            )

            if function is None:

                result = {
                    "error": (
                        f"Unknown tool: {function_name}"
                    )
                }

            else:

                result = function()

                collected_evidence.append({
                    "tool": function_name,
                    "result": result,
                })

            function_responses.append(
                types.Part.from_function_response(
                    name=function_name,
                    response=result,
                )
            )

        contents.append(
            types.Content(
                role="user",
                parts=function_responses,
            )
        )

    return collected_evidence

def generate_diagnosis(
    incident_description: str,
    evidence: list[dict],
    retrieved_knowledge: list[dict],
) -> IncidentDiagnosis:

    prompt = f"""
    {DIAGNOSIS_PROMPT}

    Incident:

    {incident_description}

    Current production evidence:

    {evidence}

    Relevant historical knowledge and runbooks:

    {retrieved_knowledge}
    """

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=DIAGNOSIS_RESPONSE_SCHEMA,
        ),
    )

    print("========== GEMINI RESPONSE ==========")
    print(response.text)
    print("======================================")

    diagnosis = IncidentDiagnosis.model_validate_json(
        response.text
    )

    return diagnosis


def generate_playbook(
    remediation_action: str,
    diagnosis: str,
) -> GeneratedPlaybook:

    prompt = f"""
{PLAYBOOK_GENERATION_PROMPT}

Remediation action:
{remediation_action}

Diagnosis:
{diagnosis}
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt
    )

    raw_playbook = response.text.strip()

    filename = save_generated_playbook(
        remediation_action=remediation_action,
        playbook=raw_playbook,
    )

    return GeneratedPlaybook(
        playbook=raw_playbook,
        filename=filename,
    )