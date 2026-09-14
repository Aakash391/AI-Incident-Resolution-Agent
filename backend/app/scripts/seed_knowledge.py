from app.ai.embeddings import generate_embedding
from app.db.session import SessionLocal
from app.repositories.knowledge_repository import (
    create_document,
)


KNOWLEDGE = [
    {
        "title": "Database Connection Pool Exhaustion",
        "document_type": "runbook",
        "content": """
If the application is returning HTTP 503 errors and
database connection usage is at or near the configured
maximum, investigate database connection pool exhaustion.

Recommended investigation:

1. Check active database connections.
2. Check application connection pool usage.
3. Inspect application logs for connection timeout errors.

If confirmed, restart affected application instances
after verifying that restarting is permitted by the
production policy.
""",
    },
    {
        "title": "Historical Incident 102",
        "document_type": "incident",
        "content": """
The fashion storefront returned HTTP 503 errors.

Root cause:
Database connection pool exhaustion.

Evidence:
Application logs showed database connection timeout
errors and database connections were at the configured
maximum.

Resolution:
The affected application instances were restarted.

Verification:
HTTP requests returned 200 after remediation and
database connection usage returned to normal.
""",
    },
    {
        "title": "Application HTTP 503 Runbook",
        "document_type": "runbook",
        "content": """
When the storefront returns HTTP 503:

1. Check application health.
2. Check recent application logs.
3. Check CPU and memory.
4. Check database connectivity.
5. Check whether a recent deployment occurred.

Do not immediately restart the application without
collecting evidence.
""",
    },
]


def seed():

    db = SessionLocal()

    try:

        for item in KNOWLEDGE:

            embedding = generate_embedding(
                item["content"]
            )

            create_document(
                db=db,
                title=item["title"],
                content=item["content"],
                document_type=item["document_type"],
                embedding=embedding,
            )

    finally:

        db.close()


if __name__ == "__main__":
    seed()