-- Allow inviting by email, even for unregistered users.
-- When user_id is NULL, invited_email stores the target email.
-- On login/register, claim_email_invitations() links user_id.

-- 1. Make user_id nullable and add invited_email column
ALTER TABLE tree_members ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE tree_members ADD COLUMN IF NOT EXISTS invited_email TEXT;

-- 2. Drop the old unique constraint and create a new one that handles both cases
ALTER TABLE tree_members DROP CONSTRAINT IF EXISTS tree_members_tree_id_user_id_key;

-- Unique: one user per tree (when user_id is known)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tree_members_tree_user
  ON tree_members(tree_id, user_id) WHERE user_id IS NOT NULL;

-- Unique: one email per tree (when invited by email, user not yet registered)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tree_members_tree_email
  ON tree_members(tree_id, invited_email) WHERE invited_email IS NOT NULL AND user_id IS NULL;

-- 3. Index for email lookup on login
CREATE INDEX IF NOT EXISTS idx_tree_members_invited_email
  ON tree_members(invited_email) WHERE invited_email IS NOT NULL;

-- 4. Helper: get current user's email (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION get_my_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- 5. Function: claim pending email invitations for a user
CREATE OR REPLACE FUNCTION claim_email_invitations(p_user_id UUID, p_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE tree_members
  SET user_id = p_user_id
  WHERE invited_email = lower(p_email)
    AND user_id IS NULL;
END;
$$;

-- 6. Update tree_members_select to also allow reading rows where invited_email matches
DROP POLICY IF EXISTS "tree_members_select" ON tree_members;
CREATE POLICY "tree_members_select" ON tree_members FOR SELECT
  USING (
    is_tree_owner(tree_id)
    OR has_tree_access(tree_id, 'viewer')
    OR user_id = auth.uid()
    OR invited_email = get_my_email()
  );

-- 7. Update tree_members_update to allow email-invited users to accept (set user_id + accepted_at)
DROP POLICY IF EXISTS "tree_members_update" ON tree_members;
CREATE POLICY "tree_members_update" ON tree_members FOR UPDATE
  USING (
    is_tree_owner(tree_id)
    OR has_tree_access(tree_id, 'owner')
    OR user_id = auth.uid()
    OR invited_email = get_my_email()
  );

-- 8. Update tree_members_delete to allow users to decline their own email invitations
DROP POLICY IF EXISTS "tree_members_delete" ON tree_members;
CREATE POLICY "tree_members_delete" ON tree_members FOR DELETE
  USING (
    is_tree_owner(tree_id)
    OR has_tree_access(tree_id, 'owner')
    OR user_id = auth.uid()
    OR invited_email = get_my_email()
  );
