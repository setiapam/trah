-- Fix RLS: tambahkan akses owner tree ke persons, relationships, media
-- Masalah: has_tree_access() hanya mengecek tree_members, bukan owner_id dari trees
-- Sehingga owner tree yang baru dibuat (belum ada di tree_members) tidak bisa
-- INSERT/SELECT persons, relationships, dan media di tree miliknya sendiri.

-- Helper: cek apakah user adalah owner dari tree
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

-- Drop existing policies dan buat ulang dengan owner check

-- persons
DROP POLICY IF EXISTS "persons_select" ON persons;
DROP POLICY IF EXISTS "persons_insert" ON persons;
DROP POLICY IF EXISTS "persons_update" ON persons;
DROP POLICY IF EXISTS "persons_delete" ON persons;

CREATE POLICY "persons_select" ON persons FOR SELECT
  USING (has_tree_access(tree_id, 'viewer') OR is_tree_owner(tree_id));

CREATE POLICY "persons_insert" ON persons FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

CREATE POLICY "persons_update" ON persons FOR UPDATE
  USING (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

CREATE POLICY "persons_delete" ON persons FOR DELETE
  USING (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

-- relationships
DROP POLICY IF EXISTS "relationships_select" ON relationships;
DROP POLICY IF EXISTS "relationships_insert" ON relationships;
DROP POLICY IF EXISTS "relationships_update" ON relationships;
DROP POLICY IF EXISTS "relationships_delete" ON relationships;

CREATE POLICY "relationships_select" ON relationships FOR SELECT
  USING (has_tree_access(tree_id, 'viewer') OR is_tree_owner(tree_id));

CREATE POLICY "relationships_insert" ON relationships FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

CREATE POLICY "relationships_update" ON relationships FOR UPDATE
  USING (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

CREATE POLICY "relationships_delete" ON relationships FOR DELETE
  USING (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

-- media
DROP POLICY IF EXISTS "media_select" ON media;
DROP POLICY IF EXISTS "media_insert" ON media;
DROP POLICY IF EXISTS "media_delete" ON media;

CREATE POLICY "media_select" ON media FOR SELECT
  USING (has_tree_access(tree_id, 'viewer') OR is_tree_owner(tree_id));

CREATE POLICY "media_insert" ON media FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

CREATE POLICY "media_delete" ON media FOR DELETE
  USING (has_tree_access(tree_id, 'editor') OR is_tree_owner(tree_id));

-- tree_members: owner juga bisa manage members langsung
DROP POLICY IF EXISTS "tree_members_insert" ON tree_members;
CREATE POLICY "tree_members_insert" ON tree_members FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'owner') OR is_tree_owner(tree_id));
