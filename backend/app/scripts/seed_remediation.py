from app.db.session import SessionLocal, engine
from app.models.remediation import Remediation


def seed():
    print("Database URL:", engine.url)
    db = SessionLocal()

    try:

        existing = (
            db.query(Remediation)
            .filter(
                Remediation.remediation_action
                == "restart_application_service"
            )
            .first()
        )

        if existing:
            print("Remediation already exists.")
            return

        remediation = Remediation(
            name="Restart application service",
            description=(
                "Restart the affected application service "
                "using the approved Ansible playbook."
            ),
            remediation_action="restart_application_service",
            playbook_filename = "restart_application.yaml",
            playbook="""---
- name: Restart application service
  hosts: test_storefront
  become: true

  tasks:
    - name: Restart storefront service
      ansible.builtin.service:
        name: storefront
        state: restarted
""",
            target_group="test_storefront",
            risk_level="medium",
            approved=True,
            enabled=True,
        )

        db.add(remediation)
        db.commit()

        print("Remediation created.")

    finally:
        db.close()


if __name__ == "__main__":
    seed()