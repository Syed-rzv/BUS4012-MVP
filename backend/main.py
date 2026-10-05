"""
main.py — GroundTruth FastAPI Backend

Routes:
  GET  /                 → Welcome message
  GET  /health           → Database health check
  POST /auth/signup      → Create a new user via Supabase Auth
  POST /auth/signin      → Authenticate an existing user
  POST /reports          → Submit a hazard report (auth required)
  GET  /reports          → List the current user's reports (auth required)
"""

import os
import httpx
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from database import get_connection, init_database

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# ── App ──────────────────────────────────────────────────────

app = FastAPI(
    title="GroundTruth API",
    description="Hyperlocal hazard-reporting backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Create tables, triggers, and RLS policies on first boot."""
    init_database()


# ── Auth dependency ──────────────────────────────────────────


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Extract and verify the Bearer token against Supabase Auth.
    Returns the authenticated user's UUID string.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = resp.json()
    return user["id"]


# ── Pydantic models ─────────────────────────────────────────


class AuthRequest(BaseModel):
    email: str
    password: str


class ReportCreate(BaseModel):
    hazard_type: str
    location: str
    description: str
    photo_url: Optional[str] = None
    status: Optional[str] = "active"


# ── Public routes ────────────────────────────────────────────


@app.get("/")
def root():
    return {"message": "GroundTruth API is running"}


@app.get("/health")
def health():
    """Check database connectivity."""
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


# ── Auth routes ──────────────────────────────────────────────


@app.post("/auth/signup")
async def signup(body: AuthRequest):
    """Create a new user via Supabase Auth REST API."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/signup",
            headers={
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
            },
            json={"email": body.email, "password": body.password},
        )

    data = resp.json()

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=data.get("msg") or data.get("error_description") or "Signup failed")

    return {
        "message": "Account created successfully.",
        "user_id": data.get("id"),
    }


@app.post("/auth/signin")
async def signin(body: AuthRequest):
    """Authenticate an existing user via Supabase Auth REST API."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
            headers={
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
            },
            json={"email": body.email, "password": body.password},
        )

    data = resp.json()

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {
        "user_id": data["user"]["id"],
        "access_token": data["access_token"],
    }


# ── Report routes (protected) ───────────────────────────────


@app.post("/reports")
def create_report(body: ReportCreate, user_id: str = Depends(get_current_user)):
    """Insert a new hazard report linked to the authenticated user."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO reports (user_id, hazard_type, location, description, photo_url, status)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, user_id, hazard_type, location, description, photo_url, status, created_at
            """,
            (user_id, body.hazard_type, body.location, body.description, body.photo_url, body.status),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
    finally:
        conn.close()

    return {
        "message": "Report created successfully",
        "report": {
            "id": str(row[0]),
            "user_id": str(row[1]),
            "hazard_type": row[2],
            "location": row[3],
            "description": row[4],
            "photo_url": row[5],
            "status": row[6],
            "created_at": row[7].isoformat(),
        },
    }


@app.get("/reports")
def list_reports(user_id: str = Depends(get_current_user)):
    """List all reports filed by the authenticated user."""
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, user_id, hazard_type, location, description, photo_url, status, created_at
            FROM reports
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,),
        )
        rows = cur.fetchall()
        cur.close()
    finally:
        conn.close()

    return {
        "reports": [
            {
                "id": str(r[0]),
                "user_id": str(r[1]),
                "hazard_type": r[2],
                "location": r[3],
                "description": r[4],
                "photo_url": r[5],
                "status": r[6],
                "created_at": r[7].isoformat(),
            }
            for r in rows
        ]
    }


# ── Run directly ─────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)