-- Fix sort_order for all relationships.
-- Migration 013 set initial sort_order but relationships created after the migration
-- defaulted to 0, causing all children to have the same sort_order.
-- Re-assign sort_order per parent based on created_at order (0-based).

WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (PARTITION BY person_id, relationship_type ORDER BY created_at) - 1 AS rn
  FROM relationships
)
UPDATE relationships SET sort_order = ranked.rn
FROM ranked WHERE relationships.id = ranked.id;
