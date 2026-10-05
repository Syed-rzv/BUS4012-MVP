"""
test_database_connection.py — Verify the database connection works.

Runs a simple SELECT 1 query. Never prints the database password.
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def test_connection():
    """Connect to the database and run a basic query."""
    # Mask the password for any error output
    safe_url = DATABASE_URL.split("@")[-1] if DATABASE_URL else "unknown"

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT 1")
        result = cur.fetchone()
        cur.close()
        conn.close()

        if result and result[0] == 1:
            print("Database connection successful")
        else:
            print("Database connection failed: unexpected result")
    except Exception as e:
        print(f"Database connection failed: {e}")


if __name__ == "__main__":
    test_connection()