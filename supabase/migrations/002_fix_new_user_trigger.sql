-- Fix trigger handle_new_user agar kompatibel dengan Google OAuth
-- Google mengirim metadata dengan field 'name', bukan 'full_name'
-- Tambahkan fallback chain: full_name → name → email prefix → 'Pengguna'

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
  ON CONFLICT (id) DO NOTHING;  -- Hindari error jika profil sudah ada
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
