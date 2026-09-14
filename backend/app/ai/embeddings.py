from app.ai.client import client


EMBEDDING_MODEL = "gemini-embedding-001"


def generate_embedding(text: str) -> list[float]:

    response = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config={
            "output_dimensionality": 768,
        },
    )

    return response.embeddings[0].values