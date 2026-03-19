-- =============================================
-- Cross-Tree Person Search Function
-- Bypasses RLS to allow searching persons across all trees
-- for the purpose of spouse linking.
-- Only returns basic person info + tree name (no sensitive data).
-- =============================================

CREATE OR REPLACE FUNCTION search_persons_across_trees(
  search_query TEXT,
  exclude_tree_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  tree_id UUID,
  first_name TEXT,
  last_name TEXT,
  nickname TEXT,
  gender TEXT,
  birth_date DATE,
  death_date DATE,
  is_alive BOOLEAN,
  photo_url TEXT,
  birth_place TEXT,
  death_place TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  gedcom_id TEXT,
  linked_person_id UUID,
  linked_from_tree_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  tree_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q TEXT := '%' || search_query || '%';
BEGIN
  RETURN QUERY
    SELECT
      p.id,
      p.tree_id,
      p.first_name,
      p.last_name,
      p.nickname,
      p.gender,
      p.birth_date,
      p.death_date,
      p.is_alive,
      p.photo_url,
      p.birth_place,
      p.death_place,
      p.phone,
      p.email,
      p.address,
      p.notes,
      p.gedcom_id,
      p.linked_person_id,
      p.linked_from_tree_id,
      p.created_at,
      p.updated_at,
      t.name AS tree_name
    FROM persons p
    INNER JOIN trees t ON t.id = p.tree_id
    WHERE
      (exclude_tree_id IS NULL OR p.tree_id != exclude_tree_id)
      AND (
        p.first_name ILIKE q
        OR p.last_name ILIKE q
        OR p.nickname ILIKE q
      )
    ORDER BY p.first_name
    LIMIT 50;
END;
$$;
