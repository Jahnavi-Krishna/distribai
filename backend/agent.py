import os
import json
import asyncio
from openai import OpenAI
from dotenv import load_dotenv
from rag import search_catalog

load_dotenv()

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama",
)

SYSTEM_PROMPT = """You are DistribAI, a concise AI sales assistant for an industrial equipment distributor.

STRICT RULES:
1. OFF-TOPIC (time, weather, coding, anything not about equipment):
   Reply exactly: "I'm focused on industrial equipment. Ask me about products, pricing, or quotes."

2. IDENTITY ("who are you", "what do you do"):
   Reply in 1-2 sentences only: "I'm DistribAI, your AI sales assistant — I help find equipment, check availability, and draft quotes."

3. GREETINGS ("hi", "hello"):
   1 sentence only. No products.

4. PRODUCT QUESTIONS — use this format:
   **Product Name** — key spec, key spec. **$price**. In stock / Out of stock.
   Maximum 3 products.

5. QUOTE REQUESTS:
   Subject line, greeting, itemized list with **$price** x quantity, total, sign-off.

6. NEVER invent products not in the catalog. NEVER start with "Based on the context..."
7. ALWAYS bold prices: **$849**"""


def run_agent(message: str, history: list = []) -> dict:
    retrieved = search_catalog(message, n_results=3)
    context = "\n".join([r["content"] for r in retrieved])
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history[-6:],
        {"role": "user", "content": f"Catalog context:\n{context}\n\nUser: {message}"},
    ]
    response = client.chat.completions.create(
        model="llama3.2:1b", messages=messages, temperature=0.1, max_tokens=500
    )
    return {
        "response": response.choices[0].message.content,
        "sources": [r["metadata"]["name"] for r in retrieved],
    }


async def stream_generator(message: str, history: list = []):
    """Async generator that streams tokens as Server-Sent Events."""
    retrieved = search_catalog(message, n_results=3)
    context = "\n".join([r["content"] for r in retrieved])
    sources = [r["metadata"]["name"] for r in retrieved]

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history[-6:],
        {"role": "user", "content": f"Catalog context:\n{context}\n\nUser: {message}"},
    ]

    # Send sources metadata first
    yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

    # Stream tokens from LLM
    response = client.chat.completions.create(
        model="llama3.2:1b",
        messages=messages,
        temperature=0.1,
        max_tokens=500,
        stream=True,
    )

    for chunk in response:
        delta = chunk.choices[0].delta.content
        if delta:
            yield f"data: {json.dumps({'type': 'content', 'content': delta})}\n\n"
            await asyncio.sleep(0)  # yield control to event loop

    yield f"data: {json.dumps({'type': 'done'})}\n\n"
