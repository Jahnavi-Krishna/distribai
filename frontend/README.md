# DistribAI — AI Sales Assistant for Industrial Distributors

An agentic AI assistant that helps B2B sales reps find products, check pricing and availability, and generate professional quotes — powered by Retrieval-Augmented Generation (RAG) and a local large language model.

Built to simulate the core workflow of AI teammates in distribution-heavy industries: understanding a domain-specific product catalog, retrieving relevant information semantically, and generating grounded, actionable responses.

---

## What It Does

- **Semantic product search** — Ask in plain English ("food-grade pump under $2000") and the agent retrieves the most relevant products using vector embeddings, not keyword matching
- **Grounded LLM responses** — The model only answers based on retrieved catalog data, eliminating hallucination
- **Quote generation** — Ask to draft a quote and the agent formats a professional email with itemized products and pricing
- **Conversational memory** — Maintains context across a conversation so follow-up questions work naturally
- **Availability awareness** — Flags out-of-stock items and suggests in-stock alternatives

---

## Architecture

```
React Frontend  →  FastAPI Backend  →  RAG Pipeline  →  LLM (Ollama / GPT-4o)
                                      ↑
                                Ollama Embeddings
                             + NumPy Cosine Similarity
```

**How a query works:**
1. User types a question in the chat UI
2. Backend encodes the query into a vector using `nomic-embed-text` via Ollama
3. Cosine similarity search finds the 3 most relevant products from the catalog
4. Retrieved products are injected into the LLM prompt as grounding context
5. LLM generates a response based only on that context
6. Frontend displays the answer with source attribution and quick-reply suggestion chips

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Python + FastAPI |
| Embeddings | Ollama (nomic-embed-text) + NumPy cosine similarity |
| LLM | Ollama (llama3.2:1b) locally — swap to GPT-4o for production |
| Data | 25-item industrial product catalog (JSON) |

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com/download) installed and running

### Pull required models
```bash
ollama pull nomic-embed-text
ollama pull llama3.2:1b
```

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Add your API key to .env if switching to a cloud LLM

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

- *"What pumps do you carry for food-grade applications?"*
- *"Do you have any valves under $200 in stock?"*
- *"Compare your two stainless steel pump options"*
- *"Draft a quote for Acme Corp for 3 centrifugal pumps and 1 flow meter"*
- *"What's out of stock right now?"*

---

## Current Limitations (v1 Prototype)

This is intentionally minimal — built to demonstrate the RAG + agentic AI pattern clearly.

- Product catalog is static JSON, not connected to a live inventory system
- Embeddings rebuilt in memory on every server restart (no persistence)
- Small local LLM (1.2B params) — quality improves significantly with GPT-4o or Claude
- No user authentication or session persistence
- No actual order placement or CRM write-back

---

## What's Next

**Infrastructure**
- [ ] Replace in-memory vectors with pgvector or ChromaDB for persistence and scale
- [ ] Connect to a live ERP/inventory API for real-time stock and pricing
- [ ] Swap local Ollama for OpenAI GPT-4o or Claude for production-grade reasoning

**Agent Capabilities**
- [ ] Tool use — agent takes actions (create orders, update CRM, send emails)
- [ ] Multi-agent orchestration — separate agents for retrieval, reasoning, and action
- [ ] Human-in-the-loop checkpoints before any write actions

**Product**
- [ ] User authentication and conversation history
- [ ] Admin panel for catalog management
- [ ] Analytics — what are reps asking? Which products surface most?
- [ ] Mobile-responsive UI

---

## Why This Project

Built to demonstrate practical understanding of how RAG systems actually work in production — not just the concept, but the full-stack implementation. The domain (industrial distribution) is intentionally specific because generic chatbots are not impressive. Domain-trained AI teammates that understand real business workflows are.