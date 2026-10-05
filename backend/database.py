"""
database.py — PostgreSQL connection and table initialization.

Connects to Supabase PostgreSQL using psycopg2 and executes sql/setup.sql
to create tables, triggers, and RLS policies on server startup.
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Return a new psycopg2 connection to the Supabase PostgreSQL database."""
    return psycopg2.connect(DATABASE_URL)


def init_database():
    """
    Execute sql/setup.sql to create tables, triggers, and RLS policies.
    Uses CREATE TABLE IF NOT EXISTS so it is safe to run multiple times.
    """
    sql_path = os.path.join(os.path.dirname(__file__), "sql", "setup.sql")

    with open(sql_path, "r") as f:
        sql = f.read()

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(sql)
        conn.commit()
        cur.close()
        print("Database initialization completed successfully")
    finally:
        conn.close()


if __name__ == "__main__":
    init_database()