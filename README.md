# 🌳 Trah — Nguri-uri Trah, Njaga Sejarah

> Aplikasi pencatatan silsilah keluarga digital, terinspirasi tradisi *trah* Jawa.

**Trah** adalah aplikasi web modern untuk mencatat, mengelola, dan memvisualisasikan silsilah keluarga. Dibangun khusus untuk keluarga Indonesia — dengan desain terinspirasi motif batik Jawa Tengah dan mendukung format genealogi standar internasional GEDCOM 5.5.1.

---

> ✨ **Seluruh aplikasi ini dibangun melalui proses *vibe engineering*** — dideskripsikan dalam bahasa manusia, diwujudkan oleh AI, dan diarahkan oleh intuisi. Tidak satu baris pun ditulis secara manual. Ini adalah bukti bahwa ide yang baik, arsitektur yang jelas, dan kolaborasi manusia–AI bisa menghasilkan produk nyata yang berjalan di production.

---

## Fitur

- **Visualisasi Pohon Keluarga** — tampilan pohon interaktif (pan, zoom, klik node) menggunakan Vue Flow & D3.js
- **Manajemen Anggota** — tambah, edit, hapus anggota keluarga beserta foto, tanggal lahir, tempat, dan catatan
- **Relasi Keluarga** — hubungan orang tua, anak, pasangan, dan saudara
- **Kolaborasi Multi-User** — undang anggota keluarga untuk berkolaborasi dengan role *editor* atau *viewer*
- **Role-Based UI** — viewer tidak bisa melihat tombol edit/tambah/hapus
- **Notifikasi Undangan** — bell icon dengan badge di header, update real-time
- **Import/Export GEDCOM** — kompatibel dengan Gramps, MyHeritage, FamilySearch
- **Import/Export JSON** — format Trah JSON untuk backup dan migrasi
- **Autentikasi** — email/password + Google OAuth
- **Dark Mode** — toggle system/light/dark di header
- **Desain Batik Jawa** — palet emas, motif kawung, tipografi Playfair Display

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Nuxt.js 4 |
| UI | Nuxt UI 3 + Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Visualisasi | Vue Flow + D3.js |
| Validasi | Zod |
| State | Pinia + Vue composables |
| Bahasa | TypeScript (strict) |
| Deploy | Cloudflare Pages |

## Arsitektur

Menggunakan **Clean Architecture** yang diadaptasi untuk Nuxt.js:

```
Presentation  →  app/pages/, app/components/
Application   →  app/composables/
Domain        →  domain/entities/, domain/repositories/
Infrastructure→  infrastructure/repositories/
External      →  Supabase Cloud
```

Supabase tidak pernah dipanggil langsung dari komponen — selalu melalui composable → repository.

## Memulai

### Prasyarat

- Node.js 20+
- pnpm
- Akun Supabase

### Instalasi

```bash
git clone https://github.com/setiapam/trah
cd trah
pnpm install
```

### Konfigurasi

Buat file `.env` dari template:

```bash
cp .env.example .env
```

Isi dengan kredensial Supabase:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

### Setup Database

Jalankan semua migration di Supabase SQL Editor secara berurutan:

```
supabase/migrations/001_init.sql
supabase/migrations/002_fix_new_user_trigger.sql
supabase/migrations/003_fix_trigger_search_path.sql
supabase/migrations/004_fix_rls_owner_access.sql
supabase/migrations/005_fix_invite_visibility.sql
supabase/migrations/006_fix_invite_flow.sql
supabase/migrations/007_fix_tree_members_select.sql
supabase/migrations/008_fix_tree_members_update_delete.sql
```

### Development

```bash
pnpm dev        # http://localhost:3000
pnpm build      # build production
pnpm preview    # preview build
pnpm typecheck  # cek TypeScript
pnpm lint       # ESLint
```

## Deploy

Aplikasi ini di-deploy di **Cloudflare Pages**. Setelah push ke `main`, build otomatis berjalan.

Pastikan konfigurasi berikut di Supabase Dashboard:
- **Site URL**: URL production (bukan localhost)
- **Redirect URLs**: tambahkan URL Cloudflare Pages

## Struktur Folder

```
trah/
├── app/
│   ├── components/       # Komponen Vue (auto-imported)
│   ├── composables/      # Application layer (use cases)
│   ├── layouts/          # default.vue, auth.vue
│   └── pages/            # File-based routing
├── domain/               # Pure TypeScript entities & interfaces
├── infrastructure/       # Implementasi Supabase repository
├── supabase/migrations/  # SQL migrations
└── CLAUDE.md             # Konteks & panduan AI agent
```

## Lisensi

MIT — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<p align="center">
  Dibuat dengan ❤️ untuk keluarga Indonesia<br>
  <em>Dibangun sepenuhnya melalui vibe engineering bersama Claude</em>
</p>
