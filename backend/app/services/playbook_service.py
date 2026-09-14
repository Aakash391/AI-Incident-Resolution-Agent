from pathlib import Path

import yaml


BASE_DIR = Path(__file__).resolve().parents[2]

RAG_PLAYBOOK_DIR = (
    BASE_DIR / "app" / "knowledge" / "playbooks"
)

GENERATED_PLAYBOOK_DIR = (
    BASE_DIR / "generated_playbooks"
)


def ensure_playbook_directories() -> None:
    RAG_PLAYBOOK_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    GENERATED_PLAYBOOK_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )


def validate_playbook(playbook: str) -> str:
    """
    Parse the generated content as YAML.

    Returns the normalized YAML string if valid.
    Raises ValueError if the playbook is invalid.
    """

    try:
        parsed = yaml.safe_load(playbook)
    except yaml.YAMLError as exc:
        raise ValueError(
            f"Invalid YAML playbook: {exc}"
        ) from exc

    if not isinstance(parsed, list):
        raise ValueError(
            "Ansible playbook must contain a YAML list of plays."
        )

    if not parsed:
        raise ValueError(
            "Ansible playbook cannot be empty."
        )

    return yaml.safe_dump(
        parsed,
        sort_keys=False,
        default_flow_style=False,
    )


def save_generated_playbook(
    remediation_action: str,
    playbook: str,
) -> str:

    ensure_playbook_directories()

    normalized_playbook = validate_playbook(
        playbook
    )

    filename = (
        f"{remediation_action}.yaml"
    )

    filepath = (
        GENERATED_PLAYBOOK_DIR / filename
    )

    filepath.write_text(
        normalized_playbook,
        encoding="utf-8",
    )

    return filename


def get_rag_playbook_path(
    filename: str,
) -> Path:

    ensure_playbook_directories()

    filepath = RAG_PLAYBOOK_DIR / filename

    if not filepath.exists():
        raise FileNotFoundError(
            f"RAG playbook not found: {filename}"
        )

    return filepath