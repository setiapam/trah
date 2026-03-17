-- Fix tree_members UPDATE/DELETE: tree owner cannot update role or remove members
-- Same root cause as 007: has_tree_access() doesn't cover trees.owner_id.

DROP POLICY IF EXISTS "tree_members_update" ON tree_members;
CREATE POLICY "tree_members_update" ON tree_members FOR UPDATE
  USING (is_tree_owner(tree_id) OR has_tree_access(tree_id, 'owner') OR user_id = auth.uid());

DROP POLICY IF EXISTS "tree_members_delete" ON tree_members;
CREATE POLICY "tree_members_delete" ON tree_members FOR DELETE
  USING (is_tree_owner(tree_id) OR has_tree_access(tree_id, 'owner'));
