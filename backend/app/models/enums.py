from enum import Enum

class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"

class IncidentPhase(str, Enum):
    INTAKE = "intake"
    INVESTIGATING = "investigating"
    DIAGNOSING = "diagnosing"
    REMEDIATION_PENDING = "remediation_pending"
    REMEDIATING = "remediating"
    VERIFYING = "verifying"
    COMPLETED = "completed"


class VerificationStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PASSED = "passed"
    FAILED = "failed"

class IncidentSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"