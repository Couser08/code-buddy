-- ==============================================================================
-- C LIVE CODING CLASSROOM (CodeClass) - COMPLETE SUPABASE POSTGRESQL & RLS SCHEMA
-- STRICT ADMIN: tungariyarahul08@gmail.com
--
-- HOW TO RUN:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query"
-- 4. Paste this entire file and click "Run" (green button)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. CLASS SESSIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('live', 'ended')) DEFAULT 'live',
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. LIVE CODE STATE (Snapshot buffer for late-joiners)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.live_code_state (
    session_id UUID PRIMARY KEY REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language_id INT NOT NULL DEFAULT 50, -- 50 = C (GCC 9.2.0)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. DOUBTS TABLE (Persisted student queue for instructor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doubts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    student_avatar TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'resolved')) DEFAULT 'open',
    admin_reply TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TASKS TABLE (Assignments created by instructor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    initial_code TEXT,
    language_id INT NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. SUBMISSIONS TABLE (Student submissions + Judge0 execution output)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_name TEXT,
    code TEXT NOT NULL,
    judge0_output JSONB,
    status TEXT NOT NULL CHECK (status IN ('pending', 'reviewed')) DEFAULT 'pending',
    teacher_feedback TEXT,
    score INT CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.class_sessions(status);
CREATE INDEX IF NOT EXISTS idx_doubts_session_status ON public.doubts(session_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_session ON public.tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task_student ON public.submissions(task_id, student_id);

-- ==============================================================================
-- STRICT SECURITY DEFINER HELPER: is_admin()
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN (
        LOWER(COALESCE(auth.jwt() ->> 'email', '')) = 'tungariyarahul08@gmail.com'
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
              AND role = 'admin' 
              AND LOWER(email) = 'tungariyarahul08@gmail.com'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- AUTOMATIC AUTH TRIGGER: assigns admin ONLY to tungariyarahul08@gmail.com
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    -- Strict email matching: only tungariyarahul08@gmail.com gets admin
    IF LOWER(NEW.email) = 'tungariyarahul08@gmail.com' THEN
        assigned_role := 'admin';
    ELSE
        assigned_role := 'student';
    END IF;

    INSERT INTO public.profiles (id, email, role, name, avatar_url, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        assigned_role,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        role = assigned_role,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_code_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can update their own profile name & avatar" ON public.profiles;
CREATE POLICY "Users can update their own profile name & avatar"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid())));

-- 2. Class Sessions Policies
DROP POLICY IF EXISTS "Sessions are viewable by all authenticated users" ON public.class_sessions;
CREATE POLICY "Sessions are viewable by all authenticated users"
    ON public.class_sessions FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Only admin can create sessions" ON public.class_sessions;
CREATE POLICY "Only admin can create sessions"
    ON public.class_sessions FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can update sessions" ON public.class_sessions;
CREATE POLICY "Only admin can update sessions"
    ON public.class_sessions FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Only admin can delete sessions" ON public.class_sessions;
CREATE POLICY "Only admin can delete sessions"
    ON public.class_sessions FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 3. Live Code State Policies
DROP POLICY IF EXISTS "Live code state is readable by all users" ON public.live_code_state;
DROP POLICY IF EXISTS "Live code state is readable by all authenticated users" ON public.live_code_state;
CREATE POLICY "Live code state is readable by all users"
    ON public.live_code_state FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Only admin can insert or update live code state" ON public.live_code_state;
DROP POLICY IF EXISTS "Allow upserting live code state for classroom sessions" ON public.live_code_state;
CREATE POLICY "Allow upserting live code state for classroom sessions"
    ON public.live_code_state FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Doubts Policies
DROP POLICY IF EXISTS "Doubts are viewable by all authenticated session users" ON public.doubts;
CREATE POLICY "Doubts are viewable by all authenticated session users"
    ON public.doubts FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Students can insert their own doubts" ON public.doubts;
CREATE POLICY "Students can insert their own doubts"
    ON public.doubts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admin can update doubts (resolve or reply)" ON public.doubts;
CREATE POLICY "Admin can update doubts (resolve or reply)"
    ON public.doubts FOR UPDATE
    TO authenticated
    USING (public.is_admin() OR auth.uid() = student_id)
    WITH CHECK (public.is_admin() OR auth.uid() = student_id);

-- 5. Tasks Policies
DROP POLICY IF EXISTS "Tasks are viewable by all authenticated users" ON public.tasks;
CREATE POLICY "Tasks are viewable by all authenticated users"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Only admin can manage tasks" ON public.tasks;
CREATE POLICY "Only admin can manage tasks"
    ON public.tasks FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Submissions Policies
DROP POLICY IF EXISTS "Students can view their own submissions; admin views all" ON public.submissions;
CREATE POLICY "Students can view their own submissions; admin views all"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id OR public.is_admin());

DROP POLICY IF EXISTS "Students can insert their own submissions" ON public.submissions;
CREATE POLICY "Students can insert their own submissions"
    ON public.submissions FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Only admin can grade and review submissions" ON public.submissions;
CREATE POLICY "Only admin can grade and review submissions"
    ON public.submissions FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION FOR ACTIVE TABLES
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'class_sessions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.class_sessions;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'live_code_state'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.live_code_state;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'doubts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.doubts;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'submissions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
    END IF;
END $$;
