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
