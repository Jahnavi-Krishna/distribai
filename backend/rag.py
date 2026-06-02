import json
import numpy as np
import httpx

OLLAMA_URL = "http://localhost:11434"
_products = []
_embeddings = None


# def _embed_one(text: str) -> list:
#     """Get embedding for a single text via Ollama."""
#     response = httpx.post(
#         f"{OLLAMA_URL}/api/embeddings",
#         json={"model": "nomic-embed-text", "prompt": text},
#         timeout=60.0,
#     )
#     return response.json()["embedding"]
def _embed_one(text: str) -> list:
    response = httpx.post(
        f"{OLLAMA_URL}/api/embeddings",
        json={"model": "nomic-embed-text", "prompt": text},
        timeout=60.0,
    )
    data = response.json()
    # print("DEBUG:", list(data.keys()))
    return data["embedding"]

def load_catalog():
    global _products, _embeddings
    with open("data/catalog.json", "r") as f:
        _products = json.load(f)

    documents = [
        f"{p['name']}. {p['description']} Specs: {p['specs']}. "
        f"Price: ${p['price']}. {'In stock' if p['in_stock'] else 'Out of stock'}."
        for p in _products
    ]

    print("Embedding catalog... (takes ~30 seconds on first run)")
    raw = np.array([_embed_one(doc) for doc in documents])
    norms = np.linalg.norm(raw, axis=1, keepdims=True)
    _embeddings = raw / norms

    print(f"Catalog loaded: {len(_products)} products indexed")


def search_catalog(query: str, n_results: int = 3) -> list:
    if _embeddings is None:
        return []

    raw_q = np.array(_embed_one(query))
    q = raw_q / np.linalg.norm(raw_q)
    similarities = _embeddings @ q
    top_idx = np.argsort(similarities)[::-1][:n_results]

    return [
        {
            "content": (
                f"{_products[i]['name']}. {_products[i]['description']} "
                f"Specs: {_products[i]['specs']}. Price: ${_products[i]['price']}. "
                f"{'In stock' if _products[i]['in_stock'] else 'Out of stock'}."
            ),
            "metadata": {
                "name": _products[i]["name"],
                "price": _products[i]["price"],
                "in_stock": _products[i]["in_stock"],
                "category": _products[i]["category"],
            },
        }
        for i in top_idx
    ]