-- Fix trigger handle_new_user: tambahkan SET search_path = public
-- Masalah: supabase_auth_admin memiliki search_path=auth
-- Sehingga SECURITY DEFINER function mewarisi search_path=auth
-- dan gagal menemukan tabel 'profiles' (ada di schema public)

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
      'Pengguna'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
