from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge import KnowledgeDocument


def create_document(
    db: Session,
    title: str,
    content: str,
    document_type: str,
    embedding: list[float],
    metadata: dict | None = None,
) -> KnowledgeDocument:

    document = KnowledgeDocument(
        title=title,
        content=content,
        document_type=document_type,
        embedding=embedding,
        metadata_=metadata,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

def search_similar_documents(
    db: Session,
    query_embedding: list[float],
    limit: int = 5,
) -> list[KnowledgeDocument]:

    statement = (
        select(KnowledgeDocument)
        .where(
            KnowledgeDocument.embedding.is_not(None)
        )
        .order_by(
            KnowledgeDocument.embedding.cosine_distance(
                query_embedding
            )
        )
        .limit(limit)
    )

    return list(
        db.scalars(statement).all()
    )