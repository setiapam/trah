-- =============================================
-- Trah — Initial Database Migration
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Table: profiles
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Table: trees
-- =============================================
CREATE TABLE IF NOT EXISTS trees (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  root_person_id UUID, -- FK added after persons table
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Table: persons
-- =============================================
CREATE TABLE IF NOT EXISTS persons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id      UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  gedcom_id    TEXT,
  first_name   TEXT NOT NULL,
  last_name    TEXT,
  nickname     TEXT,
  gender       TEXT CHECK (gender IN ('M', 'F', 'U')) NOT NULL DEFAULT 'U',
  birth_date   DATE,
  birth_place  TEXT,
  death_date   DATE,
  death_place  TEXT,
  is_alive     BOOLEAN NOT NULL DEFAULT TRUE,
  photo_url    TEXT,
  phone        TEXT,
  email        TEXT,
  address      TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tree_id, gedcom_id)
);

-- Add FK from trees.root_person_id -> persons.id
ALTER TABLE trees
  ADD CONSTRAINT fk_trees_root_person
  FOREIGN KEY (root_person_id) REFERENCES persons(id) ON DELETE SET NULL;

-- =============================================
-- Table: relationships
-- =============================================
CREATE TABLE IF NOT EXISTS relationships (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id           UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  person_id         UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  related_person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('parent', 'spouse')),
  marriage_date     DATE,
  divorce_date      DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT no_self_relation CHECK (person_id != related_person_id)
);

-- =============================================
-- Table: tree_members
-- =============================================
CREATE TABLE IF NOT EXISTS tree_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tree_id     UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (tree_id, user_id)
);

-- =============================================
-- Table: media
-- =============================================
CREATE TABLE IF NOT EXISTS media (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id  UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  tree_id    UUID NOT NULL REFERENCES trees(id) ON DELETE CASCADE,
  file_url   TEXT NOT NULL,
  file_type  TEXT NOT NULL,
  caption    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_persons_tree_id ON persons(tree_id);
CREATE INDEX IF NOT EXISTS idx_relationships_tree_id ON relationships(tree_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person_id ON relationships(person_id);
CREATE INDEX IF NOT EXISTS idx_relationships_related_person_id ON relationships(related_person_id);
CREATE INDEX IF NOT EXISTS idx_tree_members_tree_id ON tree_members(tree_id);
CREATE INDEX IF NOT EXISTS idx_tree_members_user_id ON tree_members(user_id);
CREATE INDEX IF NOT EXISTS idx_media_person_id ON media(person_id);

-- =============================================
-- Auto-update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_trees_updated_at
  BEFORE UPDATE ON trees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_persons_updated_at
  BEFORE UPDATE ON persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- profiles: user bisa read/update profil sendiri
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Helper function: cek apakah user memiliki akses ke tree
CREATE OR REPLACE FUNCTION has_tree_access(p_tree_id UUID, min_role TEXT DEFAULT 'viewer')
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM tree_members
  WHERE tree_id = p_tree_id AND user_id = auth.uid() AND accepted_at IS NOT NULL;

  IF user_role IS NULL THEN RETURN FALSE; END IF;

  RETURN CASE min_role
    WHEN 'viewer' THEN TRUE
    WHEN 'editor' THEN user_role IN ('editor', 'owner')
    WHEN 'owner'  THEN user_role = 'owner'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- trees RLS
CREATE POLICY "trees_select" ON trees FOR SELECT
  USING (has_tree_access(id, 'viewer') OR owner_id = auth.uid());

CREATE POLICY "trees_insert" ON trees FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "trees_update" ON trees FOR UPDATE
  USING (has_tree_access(id, 'editor') OR owner_id = auth.uid());

CREATE POLICY "trees_delete" ON trees FOR DELETE
  USING (owner_id = auth.uid());

-- persons RLS
CREATE POLICY "persons_select" ON persons FOR SELECT
  USING (has_tree_access(tree_id, 'viewer'));

CREATE POLICY "persons_insert" ON persons FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'editor'));

CREATE POLICY "persons_update" ON persons FOR UPDATE
  USING (has_tree_access(tree_id, 'editor'));

CREATE POLICY "persons_delete" ON persons FOR DELETE
  USING (has_tree_access(tree_id, 'editor'));

-- relationships RLS
CREATE POLICY "relationships_select" ON relationships FOR SELECT
  USING (has_tree_access(tree_id, 'viewer'));

CREATE POLICY "relationships_insert" ON relationships FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'editor'));

CREATE POLICY "relationships_update" ON relationships FOR UPDATE
  USING (has_tree_access(tree_id, 'editor'));

CREATE POLICY "relationships_delete" ON relationships FOR DELETE
  USING (has_tree_access(tree_id, 'editor'));

-- tree_members RLS
CREATE POLICY "tree_members_select" ON tree_members FOR SELECT
  USING (has_tree_access(tree_id, 'viewer') OR user_id = auth.uid());

CREATE POLICY "tree_members_insert" ON tree_members FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'owner'));

CREATE POLICY "tree_members_update" ON tree_members FOR UPDATE
  USING (has_tree_access(tree_id, 'owner') OR user_id = auth.uid());

CREATE POLICY "tree_members_delete" ON tree_members FOR DELETE
  USING (has_tree_access(tree_id, 'owner'));

-- media RLS
CREATE POLICY "media_select" ON media FOR SELECT
  USING (has_tree_access(tree_id, 'viewer'));

CREATE POLICY "media_insert" ON media FOR INSERT
  WITH CHECK (has_tree_access(tree_id, 'editor'));

CREATE POLICY "media_delete" ON media FOR DELETE
  USING (has_tree_access(tree_id, 'editor'));
