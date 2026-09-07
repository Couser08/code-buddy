-- ==============================================================================
-- MIGRATION: SAFE PROFILE UPDATES & AUTH REINFORCEMENT
-- RUN THIS IN SUPABASE SQL EDITOR TO APPLY SAFE POLICIES & PREVENT RLS RECURSION
-- ==============================================================================

-- 1. Drop all prior profile update policies to prevent Error 42710
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile name & avatar" ON public.profiles;

-- 2. Create clean, non-recursive update policy for profiles
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 3. Allow authenticated users to insert their own profile as fallback
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 4. Trigger to strictly lock role column from unauthorized tampering
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
BEGIN
    -- Prevent normal users from elevating their role to 'admin'
    IF NEW.role <> OLD.role THEN
        IF LOWER(OLD.email) = 'tungariyarahul08@gmail.com' THEN
            NEW.role := 'admin';
        ELSE
            NEW.role := 'student';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 5. Ensure anon can also view sessions for public preview
DROP POLICY IF EXISTS "Sessions are viewable by all users" ON public.class_sessions;
DROP POLICY IF EXISTS "Sessions are viewable by all authenticated users" ON public.class_sessions;
CREATE POLICY "Sessions are viewable by all users"
    ON public.class_sessions FOR SELECT
    TO anon, authenticated
    USING (true);

-- 6. Ensure live_code_state allows public read & synchronized writes
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

-- 7. Seed default instructor profile and live session so foreign key constraints succeed
DO $$
DECLARE
    teacher_uuid UUID;
BEGIN
    -- Look up existing profile id for tungariyarahul08@gmail.com
    SELECT id INTO teacher_uuid 
    FROM public.profiles 
    WHERE LOWER(email) = 'tungariyarahul08@gmail.com' 
    LIMIT 1;

    -- If no profile exists yet in public.profiles, check auth.users or use fallback
    IF teacher_uuid IS NULL THEN
        SELECT id INTO teacher_uuid 
        FROM auth.users 
        WHERE LOWER(email) = 'tungariyarahul08@gmail.com' 
        LIMIT 1;

        IF teacher_uuid IS NULL THEN
            teacher_uuid := '00000000-0000-0000-0000-000000000000';
        END IF;

        INSERT INTO public.profiles (id, email, role, name, created_at)
        VALUES (
            teacher_uuid,
            'tungariyarahul08@gmail.com',
            'admin',
            'Rahul Tungariya (Instructor)',
            NOW()
        )
        ON CONFLICT (email) DO UPDATE 
        SET role = 'admin', name = EXCLUDED.name;
    ELSE
        -- Ensure existing profile has admin role
        UPDATE public.profiles SET role = 'admin' WHERE id = teacher_uuid;
    END IF;

    -- Seed default live classroom session with resolved teacher_uuid
    INSERT INTO public.class_sessions (id, title, description, status, teacher_id, started_at, created_at)
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Introduction to C Programming: Basics, Syntax and Your First Program',
        'Master variables, memory concepts, GCC compilation flags, and write your first Hello World in C.',
        'live',
        teacher_uuid,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET teacher_id = teacher_uuid, status = 'live';
END $$;
