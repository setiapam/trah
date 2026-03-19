-- Add sort_order column to relationships for manual ordering (e.g. children without birth dates)
ALTER TABLE relationships ADD COLUMN sort_order integer NOT NULL DEFAULT 0;

-- Set initial sort_order based on existing created_at order
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY person_id, relationship_type ORDER BY created_at) AS rn
  FROM relationships
)
UPDATE relationships SET sort_order = ranked.rn
FROM ranked WHERE relationships.id = ranked.id;
