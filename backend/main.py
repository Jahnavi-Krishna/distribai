from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import rag
from agent import run_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    rag.load_catalog()  # Embed and index catalog on startup
    yield


app = FastAPI(title="DistribAI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/chat")
async def chat(request: ChatRequest):
    return run_agent(request.message, request.history)


@app.get("/health")
def health():
    return {"status": "ok"}
