-- =============================================================
-- GroundTruth — Supabase SQL Setup
-- Run this file OR let database.py execute it on server startup.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. REPORTS TABLE
--    Stores every hazard report filed by a signed-in user.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hazard_type TEXT NOT NULL,
    location    TEXT NOT NULL,
    description TEXT NOT NULL,
    photo_url   TEXT,
    status      TEXT NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. ROW-LEVEL SECURITY on reports
-- ─────────────────────────────────────────────────────────────

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own reports
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
CREATE POLICY "Users can insert own reports"
    ON reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Authenticated users can read all active reports
DROP POLICY IF EXISTS "Authenticated users can read reports" ON reports;
CREATE POLICY "Authenticated users can read reports"
    ON reports FOR SELECT
    TO authenticated
    USING (true);

-- Authenticated users can update their own reports
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
CREATE POLICY "Users can update own reports"
    ON reports FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Service role (backend) has full access
DROP POLICY IF EXISTS "Service role full access" ON reports;
CREATE POLICY "Service role full access"
    ON reports FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- 3. TRIGGER — auto-set user_id on INSERT from auth.uid()
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_report()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_created ON reports;
CREATE TRIGGER on_report_created
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_report();

-- ─────────────────────────────────────────────────────────────
-- 4. PROFILES TABLE
--    Auto-created row for every new Supabase Auth sign-up.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username   TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 5. TRIGGER — auto-create profile on new sign-up
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'email')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 6. GRANTS
-- ─────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE ON reports TO authenticated;
GRANT SELECT ON reports TO anon;
GRANT ALL ON reports TO service_role;

GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;