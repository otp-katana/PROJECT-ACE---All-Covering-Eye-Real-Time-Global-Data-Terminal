
# ─────────────────────────────────────────────────────────────────────────
# ── PART: 1 ][ APP SETUP ─────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────
# FastAPI application instance with CORS enabled for the local Vite dev...
# ...server. Protocol routers (currently just OMORI) are mounted under /api.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.protocols.omori.router import router as omori_router

app = FastAPI(title="Project ACE API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(omori_router, prefix="/api")

# ─────────────────────────────────────────────────────────────────────────
# ── PART: 2 ][ HEALTH CHECK ──────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────────────────
# Simple liveness endpoint — used to confirm the server is running.
@app.get("/health")
def health():
    return {"status": "ok"}
