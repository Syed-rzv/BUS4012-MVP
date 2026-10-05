"""
check_tables.py — Verify that the reports table and trigger exist.

Queries information_schema and pg_trigger to confirm setup.
"""

import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def check_table():
    """Check that the reports table exists and the trigger is installed."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        cur = conn.cursor()

        # 1. Verify the table exists
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'reports'
            """
        )
        row = cur.fetchone()

        if row:
            print(f"Table found: public.{row[0]}")
        else:
            print("Table NOT found: public.reports")
            return

        # 2. Verify the profiles table
        cur.execute(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'profiles'
            """
        )
        row = cur.fetchone()

        if row:
            print(f"Table found: public.{row[0]}")
        else:
            print("Table NOT found: public.profiles")

        # 3. Verify the report trigger exists
        cur.execute(
            """
            SELECT trigger_name
            FROM information_schema.triggers
            WHERE event_object_table = 'reports'
              AND trigger_name = 'on_report_created'
            """
        )
        row = cur.fetchone()

        if row:
            print(f"Trigger found: {row[0]}")
        else:
            print("Trigger NOT found: on_report_created")

        cur.close()
    finally:
        conn.close()


if __name__ == "__main__":
    check_table()