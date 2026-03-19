# Changelog

Semua perubahan penting pada proyek Trah dicatat di file ini.
Format mengikuti [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

---

## [1.1.0] — 2026-03-20

### Added

- **Tombol lihat password** — Form login dan daftar kini memiliki tombol eye icon untuk menampilkan/menyembunyikan kata sandi yang diketik
- **Salin keturunan saat buat trah baru** — Saat membuat trah baru dari seorang anggota, pasangan, anak, cucu, dan seluruh keturunannya ikut disalin beserta relasinya ke trah baru
- **Salin keturunan saat link pasangan dari trah lain** — Saat menambahkan pasangan dari trah lain, anak dan keturunan pasangan tersebut juga ikut disalin

### Fixed

- **Pesan error autentikasi palsu** — Halaman callback OAuth tidak lagi menampilkan "Gagal memproses autentikasi" ketika sesi sudah berhasil dibuat oleh modul Supabase. Menambahkan pengecekan sesi sebelum menampilkan error, dan retry untuk implicit flow

---

## [1.0.2] — 2026-03-19

### Changed

- **Favicon** — Desain baru dengan motif kawung Jawa: background gelap, huruf T emas gradient, 4 kelopak kawung sebagai ornamen, diamond accent. Tersedia dalam SVG, ICO (16/32/48px), dan apple-touch-icon (180px)
- **OG Image** — Dikompresi dari 506KB menjadi 69KB (86% lebih kecil) tanpa perubahan dimensi
- **Google Fonts** — Menggunakan variable font range (`wght@0,400..700`) dan preconnect hints untuk loading lebih cepat

### Added

- Apple touch icon (`apple-touch-icon.png`) untuk bookmark di iOS
- Web App Manifest (`site.webmanifest`) untuk PWA support
- Preconnect hints ke Google Fonts & gstatic

### Removed

- `og-image.svg` yang tidak terpakai (2.8KB)

---

## [1.0.1] — 2026-03-19

### Fixed

- **Cross-Tree Search** — Pencarian pasangan dari trah lain sekarang menampilkan hasil. Sebelumnya RLS policy memblokir pencarian karena user harus jadi member tree target. Dibuat database function `search_persons_across_trees` dengan `SECURITY DEFINER` yang bypass RLS untuk keperluan linking pasangan.

### Migrasi

| No | File | Keterangan |
|----|------|------------|
| 012 | `012_cross_tree_search_function.sql` | Function `search_persons_across_trees` untuk bypass RLS saat pencarian lintas trah |

---

## [1.0.0] — 2026-03-19

Rilis pertama Trah — aplikasi silsilah keluarga digital.

### Fitur Inti

- **Autentikasi** — Register, login (email + Google OAuth), logout, profil pengguna
- **Kelola Trah** — Buat, edit, hapus pohon keluarga (tree)
- **Kelola Anggota** — CRUD anggota keluarga (person) dengan foto, tanggal lahir/wafat, kontak, catatan
- **Relasi Keluarga** — Tambah/edit/hapus relasi orang tua, anak, pasangan dengan label peran (Ayah/Ibu)
- **Visualisasi Pohon** — D3.js tree interaktif dengan zoom, pan, dan klik navigasi
  - Pasangan ditampilkan bersebelahan (side-by-side) dengan simbol hati
  - Indikator visual untuk person yang di-link dari trah lain
- **GEDCOM Import/Export** — Mendukung format GEDCOM 5.5.1 standar internasional
- **JSON Import/Export** — Export/import data dalam format JSON dengan validasi Zod
- **Kolaborasi** — Undang anggota keluarga lain ke trah dengan role (owner/editor/viewer)
  - Undang via User ID (UUID)
  - Undang via email (termasuk email yang belum terdaftar — undangan menunggu hingga pendaftaran)
  - Notifikasi undangan masuk dengan badge count di navbar
  - Terima/tolak undangan di halaman settings
  - Direct invite link (`/invite/[token]`)
- **Cross-Tree Linking** — Hubungkan anggota keluarga antar-trah saat menikah
  - Salinan dengan link (linked copy) — data tetap terhubung tanpa duplikasi manual
  - Indikator visual di tree view, person detail, dan relation list
  - Navigasi ke person asli di trah asal
- **Buat Trah dari Anggota** — Buat trah baru dari person yang sudah ada (otomatis linked copy)
  - Viewer juga bisa membuat trah baru dari person di trah yang diundang
- **Ubah Akar Trah** — Pindahkan root person ke anggota lain
- **Foto Profil & Person** — Upload, lihat (modal full-size), dan hapus foto
- **Format Tanggal** — Semua tanggal dalam format dd/mm/yyyy (input dan tampilan)

### Landing Page & SEO

- Landing page dengan desain Batik Jawa (kawung, parang, emas)
- 8 kartu fitur unggulan + section FAQ + pepatah Jawa
- OG Image 1200x630 untuk social sharing
- Sitemap otomatis (`@nuxtjs/sitemap`)
- Structured data JSON-LD (WebSite, SoftwareApplication, FAQPage)
- Meta tags lengkap (OG, Twitter Card, canonical)
- `robots.txt` dengan sitemap reference

### Desain & UI

- Sistem desain Batik Jawa — palet emas/stone, motif kawung & parang, font Playfair Display
- Nuxt UI 3 + Tailwind CSS 4
- Dark mode (system/light/dark toggle)
- Responsive untuk mobile dan desktop
- GitHub icon di navbar (selalu tampil)

### Teknis

- Nuxt 4 (compatibility version 4) + TypeScript strict
- Clean Architecture: Domain → Infrastructure → Application → Presentation
- Supabase (PostgreSQL + Auth + Storage) dengan Row Level Security
- Zod validation untuk semua entity
- Repository pattern dengan dependency injection via plugin

### Database Migrations

| File | Deskripsi |
|------|-----------|
| `001_init.sql` | Tabel utama + RLS + triggers |
| `002_fix_new_user_trigger.sql` | Fix trigger handle_new_user |
| `003_fix_trigger_search_path.sql` | Fix search_path trigger |
| `004_fix_rls_owner_access.sql` | Fix RLS untuk tree owner |
| `005_fix_invite_visibility.sql` | Fix invited user bisa lihat undangan |
| `006_fix_invite_flow.sql` | Fix invite flow + profiles SELECT |
| `007_fix_tree_members_select.sql` | Fix tree owner bisa lihat members |
| `008_fix_tree_members_update_delete.sql` | Fix owner update/delete members |
| `009_storage_rls_policies.sql` | RLS policies untuk media bucket |
| `010_cross_tree_person_linking.sql` | Kolom linked_person_id & linked_from_tree_id |
| `011_invite_by_email.sql` | Undang via email + claim on login |
