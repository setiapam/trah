-- Fix: invited users (pending acceptance) cannot see their invitations
-- Root cause: fetchMyInvitations() joins trees(name) via PostgREST embedded select.
-- PostgREST uses INNER JOIN under the hood — if the trees row is not accessible
-- (invited user is not owner and has no accepted tree_members row), the tree_members
-- row itself is excluded from results → invited user sees 0 pending invitations.
--
-- Fix: update trees SELECT policy to also allow users who have ANY tree_members row
-- (including pending/unaccepted) to read the tree's basic info (name, id).

DROP POLICY IF EXISTS "trees_select" ON trees;

CREATE POLICY "trees_select" ON trees FOR SELECT
  USING (
    owner_id = auth.uid()
    OR has_tree_access(id, 'viewer')
    OR EXISTS (
      SELECT 1 FROM tree_members
      WHERE tree_id = id AND user_id = auth.uid()
    )
  );
