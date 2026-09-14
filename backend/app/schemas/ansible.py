from pydantic import BaseModel


class GeneratedPlaybook(BaseModel):
    playbook: str
    filename: str