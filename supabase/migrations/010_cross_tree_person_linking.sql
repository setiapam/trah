-- =============================================
-- Cross-Tree Person Linking
-- Allows copying a person from another tree with a reference back to the original.
-- =============================================

-- Add linked_person_id: references the original person in another tree
ALTER TABLE persons
  ADD COLUMN IF NOT EXISTS linked_person_id UUID REFERENCES persons(id) ON DELETE SET NULL;

-- Add linked_from_tree_id: cached tree name reference for display
ALTER TABLE persons
  ADD COLUMN IF NOT EXISTS linked_from_tree_id UUID REFERENCES trees(id) ON DELETE SET NULL;

-- Index for finding all copies of a person
CREATE INDEX IF NOT EXISTS idx_persons_linked_person_id
  ON persons(linked_person_id)
  WHERE linked_person_id IS NOT NULL;
