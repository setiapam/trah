-- Fix tree_members SELECT: tree owner cannot see members of their own tree
-- Root cause: owner is identified via trees.owner_id, not via tree_members.
-- has_tree_access() only checks tree_members with accepted_at IS NOT NULL,
-- so owner gets 0 rows when querying members of their own tree.

DROP POLICY IF EXISTS "tree_members_select" ON tree_members;
CREATE POLICY "tree_members_select" ON tree_members FOR SELECT
  USING (
    is_tree_owner(tree_id)
    OR has_tree_access(tree_id, 'viewer')
    OR user_id = auth.uid()
  );
