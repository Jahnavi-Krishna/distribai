# DistribAI — AI Sales Assistant for Industrial Distributors

An agentic AI assistant that helps B2B sales reps find products, check pricing and availability, and draft quotes — powered by RAG (Retrieval-Augmented Generation) and a large language model.

Built to simulate the core workflow of AI teammates in distribution-heavy industries: understanding a domain-specific catalog, retrieving relevant information semantically, and generating actionable, grounded responses.

---

## Architecture

```
React Frontend  →  FastAPI Backend  →  RAG Pipeline  →  LLM (Groq / Llama 3)
                                    ↑
                              ChromaDB Vector Store
                         (sentence-transformers embeddings)
```

**How it works:**
1. User asks a question in the chat UI
2. The backend embeds the query and searches the product catalog using semantic similarity
3. The top 3 matching products are injected into the LLM prompt as context
4. The LLM reasons over the retrieved context and generates a grounded response
5. The frontend displays the answer along with the source products used

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector Store | ChromaDB |
| LLM | Groq API (Llama 3.3 70B) |

---

## Setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Add your Groq API key to .env

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Example Queries

- "What pumps do you carry for food-grade applications?"
- "I need a valve for a 4-inch water line under 200 PSI"
- "Compare your two stainless steel pump options"
- "Draft a quote for Acme Corp for 2x Ball Valve Stainless 2-inch and 1x Inline Flow Meter"
- "What's in stock under $500?"
