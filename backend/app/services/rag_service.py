from sqlalchemy.orm import Session

from app.ai.embeddings import generate_embedding
from app.repositories.knowledge_repository import (
    search_similar_documents,
)


def retrieve_relevant_knowledge(
    db: Session,
    query: str,
    limit: int = 5,
) -> list[dict]:

    query_embedding = generate_embedding(query)

    documents = search_similar_documents(
        db=db,
        query_embedding=query_embedding,
        limit=limit,
    )

    return [
        {
            "title": document.title,
            "content": document.content,
            "document_type": document.document_type,
            "metadata": document.metadata_,
        }
        for document in documents
    ]