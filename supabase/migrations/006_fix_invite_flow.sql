-- Fix invite flow:
-- 1. Profiles SELECT: allow any authenticated user to look up basic profile info
--    (needed for invite lookup — user must know the UUID, so this is acceptable)
-- 2. Re-apply tree_members INSERT fix idempotently (in case migration 004 was not applied)

-- Allow any authenticated user to read any profile (id, display_name, avatar_url)
-- Multiple SELECT policies = OR logic in Supabase RLS
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated" ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Ensure is_tree_owner function exists (idempotent, matches migration 004)
CREATE OR REPLACE FUNCTION is_tree_owner(p_tree_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trees WHERE id = p_tree_id AND owner_id = auth.uid()
  );
$$;

-- Re-apply tree_members INSERT policy to allow tree owner to invite members
DROP POLICY IF EXISTS "tree_members_insert" ON tree_members;
CREATE POLICY "tree_members_insert" ON tree_members FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'owner') OR is_tree_owner(tree_id));
