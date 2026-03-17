# CLAUDE.md — Konteks Proyek Trah

## Identitas Proyek

**Nama:** Trah — Aplikasi Pencatatan Silsilah Keluarga
**Tagline:** "Nguri-uri Trah, Njaga Sejarah"
**Bahasa UI:** Bahasa Indonesia (default), Bahasa Jawa (opsional/future)
**Bahasa Kode:** English (variabel, fungsi, komentar kode dalam bahasa Inggris)

---

## Apa Itu Trah?

Trah adalah aplikasi web untuk mencatat, mengelola, dan memvisualisasikan silsilah keluarga (family tree) secara digital. Target utama pengguna di Indonesia, khususnya keluarga Jawa yang memiliki tradisi pencatatan trah (keturunan).

Aplikasi ini mendukung format standar genealogi internasional **GEDCOM 5.5.1** untuk pertukaran data dengan platform lain (Gramps, MyHeritage, FamilySearch), serta format **JSON** untuk integrasi fleksibel.

---

## Desain Visual — Sistem Batik Jawa (WAJIB diikuti)

Semua UI harus mencerminkan identitas budaya Jawa. Ini bukan opsional — selalu terapkan prinsip desain ini pada setiap komponen, halaman, dan layout baru.

### Filosofi
Desain Trah terinspirasi motif batik tradisional Jawa Tengah (kawung, parang) dan estetika keraton. Kesan yang ingin dihadirkan: **anggun, hangat, berbudaya, modern**.

### Palet Warna

| Token | Nilai | Keterangan |
|-------|-------|------------|
| Primary | `amber` (via `app.config.ts`) | Emas / emas Jawa |
| Neutral | `stone` (via `app.config.ts`) | Tanah / batu alam |
| `--trah-emas` | `#d97706` | Amber utama |
| `--trah-emas-light` | `#fbbf24` | Emas terang |
| `--trah-emas-dark` | `#92400e` | Soga coklat tua |
| `--trah-soga` | `#78350f` | Coklat soga batik |
| `--trah-gading` | `#fffbeb` | Krem / gading |

### Tipografi

- **Heading (h1, h2):** Playfair Display serif — dimuat dari Google Fonts di `main.css`
- **Body:** System font stack (default Tailwind)
- Gunakan class `font-javanese` untuk judul yang ingin menonjol

### Kelas CSS Kustom (tersedia di `app/assets/css/main.css`)

| Kelas | Keterangan |
|-------|------------|
| `bg-kawung` | Background motif kawung 40px |
| `bg-kawung-lg` | Background motif kawung 80px |
| `bg-parang` | Background motif parang diagonal |
| `border-emas-top` | Border top gradient emas (via `::before`) |
| `card-emas` | Card dengan gold top bar ornamen |
| `trah-divider` | Divider emas dengan teks tengah |
| `trah-title` | Judul dengan underline gradient emas |
| `trah-ornament` | Label kecil kursif dengan berlian di kiri-kanan |
| `trah-logo` | Logo "Trah" gradient emas |
| `font-javanese` | Playfair Display serif |

### Aturan Penerapan

1. **Layouts:** `default.vue` — header pakai `border-emas-top`, background `bg-kawung`, logo pakai `trah-logo`. `auth.vue` — background `bg-kawung-lg` di atas `bg-amber-50`, card dengan `card-emas`.
2. **Headings h1/h2:** Selalu tambahkan `font-javanese` dan warna `text-stone-800`.
3. **Cards:** Gunakan `card-emas` + `ring-1 ring-amber-200/60` alih-alih `UCard` bawaan untuk elemen utama.
4. **Stat numbers:** Pakai `text-amber-600 font-javanese`.
5. **Dividers:** Pakai `trah-divider` bukan `border-t` polos.
6. **Subteks dekoratif:** Pakai `trah-ornament` untuk label kecil bertema (misal: "Anggota Keluarga", "Fitur Unggulan").
7. **Hero/banner gelap:** Gunakan `from-amber-950 via-stone-900 to-amber-900` + `bg-kawung-lg`.
8. **Empty state icons:** Letakkan dalam `w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center`.
9. **Jangan** gunakan warna `gray-*` — ganti dengan `stone-*` yang lebih hangat.

---

## Tech Stack (WAJIB diikuti)

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | **Nuxt.js** | **4.4.2** (compatibility version 4) |
| UI | **Nuxt UI 3** + **Tailwind CSS 4** | Latest |
| State | **Pinia** + `useState` composable | Via `@pinia/nuxt` |
| Backend | **Supabase** (PostgreSQL + Auth + Storage + Realtime) | Latest |
| Visualisasi | **D3.js** atau **Vue Flow** | d3@^7.9, @vue-flow/core@^1.41 |
| Validasi | **Zod** | ^3.23 |
| Testing | **Vitest** + **Vue Test Utils** + **Playwright** | Latest |
| Language | **TypeScript** | ^5.7 |
| Package Manager | **pnpm** (preferred) atau npm | — |

### Nuxt Config Wajib

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: { compatibilityVersion: 4 },
  modules: [
    '@nuxtjs/supabase',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],
  supabase: {
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      exclude: ['/', '/about'],
    }
  }
})
```

---

## Arsitektur: Clean Architecture untuk Nuxt.js

Proyek ini menggunakan **Clean Architecture** yang diadaptasi untuk konvensi Nuxt.js 4. Setiap layer HARUS dipisahkan dengan jelas. **Jangan campur logic Supabase di dalam components atau pages.**

### Diagram Layer

```
Presentation Layer  →  app/pages/, app/components/, app/layouts/
        ↓
Application Layer   →  app/composables/ (use cases)
        ↓
Domain Layer        →  domain/entities/, domain/repositories/, domain/rules/
        ↓
Infrastructure      →  infrastructure/repositories/, infrastructure/parsers/
        ↓
External Services   →  Supabase Cloud (DB, Auth, Storage, Realtime)
```

### Aturan Dependency

- **Presentation** boleh import dari **Application** (composables) saja
- **Application** (composables) boleh import dari **Domain** dan **Infrastructure**
- **Domain** TIDAK boleh import dari layer manapun (pure TypeScript, zero dependencies)
- **Infrastructure** boleh import dari **Domain** (implements interfaces)
- **JANGAN** import Supabase client langsung di components/pages — selalu lewat composable → repository

---

## Struktur Folder

```
trah-web/
├── app/                          # Nuxt app directory (Nuxt 4 convention)
│   ├── assets/                   # CSS, static images
│   ├── components/               # Vue components (auto-imported)
│   │   ├── auth/                 # AuthForm, OAuthButtons
│   │   ├── tree/                 # TreeView, TreeNode, TreeEdge, TreeSearch, ShareTree
│   │   ├── person/               # PersonForm, PersonCard, PhotoUpload, RelationshipSelector
│   │   ├── gedcom/               # ImportDropzone, ExportDialog, ValidationResult
│   │   └── shared/               # AppHeader, AppSidebar, ConfirmDialog, EmptyState
│   ├── composables/              # Vue composables = Application Layer (auto-imported)
│   │   ├── useAuth.ts
│   │   ├── useTree.ts
│   │   ├── usePerson.ts
│   │   ├── useRelationship.ts
│   │   ├── useTreeMembers.ts
│   │   ├── useTreeData.ts        # Combined tree data for visualization
│   │   ├── useGedcom.ts
│   │   └── useJsonExport.ts
│   ├── layouts/
│   │   ├── default.vue           # Sidebar + header (authenticated)
│   │   └── auth.vue              # Centered card (login/register)
│   ├── middleware/
│   │   └── auth.ts               # Route guard
│   ├── pages/                    # File-based routing
│   │   ├── index.vue             # Landing page (public)
│   │   ├── auth/
│   │   │   ├── login.vue
│   │   │   ├── register.vue
│   │   │   └── callback.vue
│   │   ├── dashboard/
│   │   │   └── index.vue         # Tree list, create new
│   │   ├── tree/
│   │   │   ├── [id].vue          # Tree visualization
│   │   │   └── new.vue           # Create tree wizard
│   │   ├── person/
│   │   │   └── [id].vue          # Person detail
│   │   ├── settings/
│   │   │   ├── index.vue
│   │   │   ├── import.vue
│   │   │   └── export.vue
│   │   └── invite/
│   │       └── [token].vue       # Accept invitation
│   └── plugins/
│       └── repositories.ts       # DI: provide repository instances
│
├── domain/                       # Domain Layer (PURE TypeScript, no framework deps)
│   ├── entities/
│   │   ├── person.ts             # Person interface + getFullName()
│   │   ├── tree.ts               # Tree interface
│   │   ├── relationship.ts       # Relationship interface
│   │   ├── media.ts              # Media interface
│   │   └── treeMember.ts         # TreeMember interface
│   ├── repositories/             # Abstract interfaces (contracts)
│   │   ├── IPersonRepository.ts
│   │   ├── ITreeRepository.ts
│   │   ├── IRelationshipRepository.ts
│   │   ├── IMediaRepository.ts
│   │   └── ITreeMemberRepository.ts
│   └── rules/                    # Business validation
│       ├── personRules.ts        # Date validation, required fields
│       └── relationshipRules.ts  # No circular, no self-relation
│
├── infrastructure/               # Infrastructure Layer
│   ├── repositories/             # Supabase implementations
│   │   ├── SupabasePersonRepository.ts
│   │   ├── SupabaseTreeRepository.ts
│   │   ├── SupabaseRelationshipRepository.ts
│   │   ├── SupabaseMediaRepository.ts
│   │   └── SupabaseTreeMemberRepository.ts
│   └── parsers/
│       ├── gedcom/
│       │   ├── GedcomParser.ts       # .ged → structured data
│       │   ├── GedcomSerializer.ts   # structured data → .ged
│       │   ├── types.ts              # GedcomIndividual, GedcomFamily, etc.
│       │   └── dateUtils.ts          # GEDCOM date format helpers
│       └── json/
│           ├── TrahJsonService.ts    # JSON export/import
│           └── schema.ts             # Zod schema for Trah JSON format
│
├── supabase/
│   └── migrations/
│       └── 001_init.sql          # All CREATE TABLE + RLS
│
├── tests/
│   ├── domain/                   # Unit tests for entities & rules
│   ├── infrastructure/           # Integration tests for repositories
│   ├── composables/              # Composable tests
│   ├── components/               # Component tests
│   ├── parsers/                  # GEDCOM & JSON parser tests
│   └── e2e/                      # Playwright E2E tests
│
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── .env.example
└── CLAUDE.md                     # File ini
```

---

## Database Schema

Semua tabel di Supabase PostgreSQL. **RLS (Row Level Security) WAJIB aktif di semua tabel.**

### Tabel: `profiles`
Linked ke `auth.users`. Dibuat otomatis saat user register (via trigger atau client).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK, FK → auth.users | Dari Supabase Auth |
| display_name | TEXT, NOT NULL | Nama tampilan |
| avatar_url | TEXT, nullable | URL foto profil |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Tabel: `trees`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK | gen_random_uuid() |
| owner_id | UUID, FK → profiles.id, NOT NULL | Pemilik tree |
| name | TEXT, NOT NULL | Nama trah |
| description | TEXT, nullable | Deskripsi |
| root_person_id | UUID, FK → persons.id, nullable | Leluhur tertua |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Tabel: `persons`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK | gen_random_uuid() |
| tree_id | UUID, FK → trees.id, NOT NULL | Tree pemilik |
| gedcom_id | TEXT, nullable | UNIQUE per tree, ID GEDCOM (@I1@ dst) |
| first_name | TEXT, NOT NULL | Nama depan |
| last_name | TEXT, nullable | Nama belakang / marga |
| nickname | TEXT, nullable | Nama panggilan |
| gender | TEXT, CHECK (M/F/U) | Jenis kelamin |
| birth_date | DATE, nullable | Tanggal lahir |
| birth_place | TEXT, nullable | Tempat lahir |
| death_date | DATE, nullable | Tanggal wafat |
| death_place | TEXT, nullable | Tempat wafat |
| is_alive | BOOLEAN, DEFAULT TRUE | Status hidup |
| photo_url | TEXT, nullable | URL foto utama |
| phone | TEXT, nullable | Telepon |
| email | TEXT, nullable | Email |
| address | TEXT, nullable | Alamat |
| notes | TEXT, nullable | Catatan |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### Tabel: `relationships`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK | gen_random_uuid() |
| tree_id | UUID, FK → trees.id | Tree terkait |
| person_id | UUID, FK → persons.id | Orang pertama |
| related_person_id | UUID, FK → persons.id | Orang kedua |
| relationship_type | TEXT, CHECK (parent, spouse) | Tipe relasi |
| marriage_date | DATE, nullable | Tanggal nikah |
| divorce_date | DATE, nullable | Tanggal cerai |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

**Constraint:** `person_id != related_person_id`

**Semantik relasi:**
- `parent`: `person_id` adalah **orang tua** dari `related_person_id`
- `spouse`: `person_id` dan `related_person_id` adalah **pasangan**

### Tabel: `tree_members`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK | gen_random_uuid() |
| tree_id | UUID, FK → trees.id | Tree yang diakses |
| user_id | UUID, FK → profiles.id | User yang diberi akses |
| role | TEXT, CHECK (owner/editor/viewer) | Hak akses |
| invited_at | TIMESTAMPTZ | DEFAULT NOW() |
| accepted_at | TIMESTAMPTZ, nullable | Waktu diterima |

**Constraint:** `UNIQUE(tree_id, user_id)`

### Tabel: `media`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK | gen_random_uuid() |
| person_id | UUID, FK → persons.id | Anggota terkait |
| tree_id | UUID, FK → trees.id | Tree terkait |
| file_url | TEXT, NOT NULL | URL di Supabase Storage |
| file_type | TEXT, NOT NULL | MIME type |
| caption | TEXT, nullable | Keterangan |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### RLS Policy Pattern

Semua tabel menggunakan pola: user hanya bisa akses data dari tree yang dia miliki (`owner_id`) ATAU tree yang dia jadi member (`tree_members`).

```sql
-- Contoh untuk tabel persons:
CREATE POLICY "Users can view persons in accessible trees"
ON persons FOR SELECT USING (
  tree_id IN (
    SELECT id FROM trees WHERE owner_id = auth.uid()
    UNION
    SELECT tree_id FROM tree_members WHERE user_id = auth.uid()
  )
);
```

Buat policy serupa untuk INSERT, UPDATE, DELETE dengan memperhitungkan role (viewer tidak boleh INSERT/UPDATE/DELETE).

---

## Konvensi Kode

### Naming

| Item | Konvensi | Contoh |
|------|----------|--------|
| File component | PascalCase | `PersonForm.vue`, `TreeView.vue` |
| File composable | camelCase dengan prefix `use` | `usePerson.ts`, `useTree.ts` |
| File entity/interface | camelCase | `person.ts`, `relationship.ts` |
| File repository | PascalCase | `SupabasePersonRepository.ts` |
| Variable/function | camelCase | `getFullName()`, `treeId` |
| Interface | PascalCase, prefix `I` untuk repo | `Person`, `IPersonRepository` |
| Type | PascalCase | `RelationshipType`, `GedcomImportResult` |
| Database kolom | snake_case | `first_name`, `tree_id`, `birth_date` |
| CSS class | Tailwind utility classes | Tidak pakai custom CSS kecuali sangat perlu |

### TypeScript

- **Strict mode ON** — `strict: true` di tsconfig.json
- Gunakan `interface` untuk entity shapes, `type` untuk unions dan utilities
- Semua function parameters dan return types WAJIB di-type
- Jangan gunakan `any` — pakai `unknown` jika benar-benar tidak tahu type-nya
- Gunakan Zod untuk runtime validation, TypeScript interface untuk compile-time

### Vue / Nuxt

- Gunakan `<script setup lang="ts">` di semua `.vue` files
- Gunakan Nuxt auto-imports (jangan manual import `ref`, `computed`, `useRoute`, dll)
- Composables di `app/composables/` otomatis auto-imported
- Components di `app/components/` otomatis auto-imported
- Gunakan `useAsyncData` atau `useFetch` untuk data fetching (SSR-compatible)
- **JANGAN** gunakan `onMounted` untuk data fetching — gunakan `useAsyncData`
- Gunakan `definePageMeta` untuk middleware dan layout per-page

### Supabase

- Akses client via `useSupabaseClient()` (auto-provided oleh `@nuxtjs/supabase`)
- Akses user via `useSupabaseUser()`
- **JANGAN** hardcode Supabase URL/key — sudah di-handle oleh module
- Selalu handle error dari Supabase: `const { data, error } = await client.from(...)`
- Untuk bulk insert, chunk menjadi batch 100 records

---

## GEDCOM 5.5.1 — Aturan Penting

GEDCOM adalah format teks dengan level-based structure. Setiap baris: `LEVEL [XREF] TAG [VALUE]`

### Mapping GEDCOM → Database

| GEDCOM | Database |
|--------|----------|
| `0 @I1@ INDI` | Buat row di `persons` |
| `1 NAME First /Last/` | `first_name` = "First", `last_name` = "Last" |
| `1 SEX M` | `gender` = "M" |
| `1 BIRT` → `2 DATE 15 JAN 1920` | `birth_date` = "1920-01-15" |
| `1 BIRT` → `2 PLAC Surakarta` | `birth_place` = "Surakarta" |
| `1 DEAT` → `2 DATE 03 MAR 2005` | `death_date` = "2005-03-03", `is_alive` = false |
| `0 @F1@ FAM` | Buat rows di `relationships` |
| `1 HUSB @I1@` + `1 WIFE @I2@` | relationship_type = "spouse" |
| `1 CHIL @I3@` | relationship_type = "parent" (HUSB→CHIL dan WIFE→CHIL) |
| `1 MARR` → `2 DATE 10 JUN 1945` | `marriage_date` = "1945-06-10" |

### Format Tanggal GEDCOM

```
DD MMM YYYY  →  "15 JAN 1920"
MMM YYYY     →  "JAN 1920"       (tanggal parsial, simpan sebagai 1 Jan)
YYYY         →  "1920"           (tanggal parsial, simpan sebagai 1 Jan)
```

Bulan: JAN, FEB, MAR, APR, MAY, JUN, JUL, AUG, SEP, OCT, NOV, DEC

### Header GEDCOM Export

```
0 HEAD
1 SOUR TRAH
2 VERS 1.0
2 NAME Trah - Silsilah Keluarga
1 GEDC
2 VERS 5.5.1
2 FORM LINEAGE-LINKED
1 CHAR UTF-8
```

Footer: `0 TRLR`

### Edge Cases yang HARUS Di-handle

1. **Nama tanpa marga:** `1 NAME Soekarno //` (last_name kosong)
2. **Tanggal parsial:** Hanya tahun atau bulan+tahun
3. **UTF-8 characters:** Nama dengan aksara khusus
4. **Circular references:** Validasi, jangan crash
5. **Missing references:** `@I99@` yang tidak ada di file → skip dengan warning
6. **Large files:** 10.000+ records harus selesai < 30 detik

---

## Tahapan Implementasi

Implementasi dibagi menjadi **12 tahap** yang harus dikerjakan **secara berurutan** (kecuali tahap 7-10 yang bisa paralel). Setiap tahap memiliki done criteria yang harus dipenuhi sebelum lanjut.

### Tahap 1: Project Scaffolding & Konfigurasi Dasar
**Input:** Tidak ada
**Output:** Project Nuxt berjalan, folder structure lengkap, linting & test runner siap
**Tasks:**
- Init Nuxt project dengan `npx nuxi@latest init trah-web`
- Install semua dependencies (lihat Tech Stack)
- Setup `nuxt.config.ts` dengan modules dan Supabase config
- Buat seluruh folder structure sesuai clean architecture
- Setup `.env`, `.env.example`, `.gitignore`
- Setup ESLint + Prettier
- Setup Vitest config
- Buat layout `default.vue` dan `auth.vue`
**Done:** `nuxt dev` jalan tanpa error, lint pass, test runner bisa dijalankan

### Tahap 2: Database & Supabase Setup
**Input:** Tahap 1 selesai, Supabase project sudah dibuat
**Output:** Database siap pakai, koneksi terverifikasi
**Tasks:**
- Buat file SQL migration (`supabase/migrations/001_init.sql`) dengan semua tabel + RLS
- Jalankan migration di Supabase
- Setup Storage bucket "media"
- Konfigurasi Auth providers (Email, Google, Apple)
- Test koneksi Nuxt → Supabase
- Generate TypeScript types dari schema
**Done:** Semua tabel terbuat, RLS aktif, koneksi verified, types tersedia

### Tahap 3: Domain Layer & Entities
**Input:** Tahap 2 selesai
**Output:** Semua entity, interface, dan business rules terdefinisi dengan test
**Tasks:**
- Buat TypeScript interfaces untuk semua entities (Person, Tree, Relationship, Media, TreeMember)
- Buat Zod validation schemas untuk setiap entity
- Buat repository interfaces (IPersonRepository, ITreeRepository, dll)
- Buat business rules (no circular relations, date validation, required field checks)
- Unit test semua validations dan rules
**Done:** Semua interfaces terdefinisi, Zod schemas valid, unit tests pass

### Tahap 4: Infrastructure Layer (Repositories)
**Input:** Tahap 3 selesai
**Output:** Semua repository Supabase berfungsi
**Tasks:**
- Implementasi `SupabasePersonRepository` (CRUD + bulkInsert)
- Implementasi `SupabaseTreeRepository`
- Implementasi `SupabaseRelationshipRepository`
- Implementasi `SupabaseMediaRepository` (termasuk Storage upload/delete)
- Implementasi `SupabaseTreeMemberRepository`
- Buat Nuxt plugin untuk dependency injection repositories
- Integration tests terhadap Supabase
**Done:** Semua repo bisa CRUD, bulk insert works, integration tests pass

### Tahap 5: Autentikasi & User Management
**Input:** Tahap 4 selesai
**Output:** Auth flow lengkap berfungsi
**Tasks:**
- Buat `useAuth` composable (login, register, logout, session)
- Buat auth middleware (redirect ke login jika belum auth)
- Buat halaman login (email/password + OAuth buttons)
- Buat halaman register
- Buat halaman callback (OAuth redirect)
- Buat halaman profile management
- Buat auth layout
- E2E test auth flow
**Done:** User bisa register, login, logout. Middleware melindungi protected routes.

### Tahap 6: CRUD Anggota Keluarga (Persons)
**Input:** Tahap 5 selesai
**Output:** User bisa mengelola tree dan anggota keluarga
**Tasks:**
- Buat `useTree`, `usePerson`, `useRelationship` composables
- Buat halaman Dashboard (list trees)
- Buat halaman New Tree (wizard: nama trah → anggota pertama)
- Buat component PersonForm (modal/slideover, dipakai untuk add & edit)
- Buat halaman Person Detail (profil lengkap, relasi, foto)
- Buat component RelationshipSelector (pilih: tambah orang tua/pasangan/anak/saudara)
- Buat component PhotoUpload (upload ke Supabase Storage)
- Tests
**Done:** Full CRUD tree + person + relationship + photo, data tersimpan di Supabase

### Tahap 7: Visualisasi Pohon Keluarga
**Input:** Tahap 6 selesai
**Output:** Pohon keluarga tervisualisasi interaktif
**Tasks:**
- Buat `useTreeData` composable (combine persons + relationships → tree structure)
- Implementasi tree layout algorithm (D3 hierarchy / Buchheim-Unger-Leipert)
- Buat TreeView component (SVG/Canvas rendering)
- Buat TreeNode component (foto, nama, tanggal dalam node)
- Buat TreeEdge component (garis penghubung)
- Implementasi Pan & Zoom (d3-zoom)
- Implementasi node interactions (click, right-click, double-click)
- Buat TreeSearch component (cari & scroll to node)
- Buat halaman Tree (tree view + sidebar controls)
- Responsive design untuk mobile
**Done:** Tree tervisualisasi benar, zoom/pan works, search works, responsif

### Tahap 8: GEDCOM Import/Export ⚡ (paralel dengan 7, 9, 10)
**Input:** Tahap 6 selesai
**Output:** GEDCOM import/export berfungsi penuh
**Tasks:**
- Implementasi `GedcomParser` (parse .ged → structured data)
- Implementasi `GedcomSerializer` (data → .ged string)
- Implementasi date utilities (GEDCOM date ↔ ISO date)
- Buat `useGedcom` composable (orchestration)
- Buat Import UI (drag-drop, preview, import button)
- Buat Export UI (select tree, download)
- Buat ValidationResult component (warnings/errors)
- Roundtrip test, cross-platform test, large file test
**Done:** Import/export works, roundtrip lossless, file dari platform lain importable

### Tahap 9: JSON Import/Export ⚡ (paralel)
**Input:** Tahap 6 selesai
**Output:** JSON import/export berfungsi
**Tasks:**
- Definisikan Zod schema untuk Trah JSON format
- Implementasi `TrahJsonService` (export/import + partial export)
- Buat `useJsonExport` composable
- Integrasikan ke halaman Import/Export yang sudah ada
- Unit tests
**Done:** JSON export/import works, schema validation benar

### Tahap 10: Kolaborasi & Sharing ⚡ (paralel)
**Input:** Tahap 6 selesai
**Output:** Multi-user collaboration berfungsi
**Tasks:**
- Buat `useTreeMembers` composable
- Buat ShareTree component (invite via email, manage members)
- Implementasi role-based UI (conditional rendering per role)
- Setup Supabase Realtime subscription untuk live sync
- Buat halaman invite acceptance
- Permission tests
**Done:** Invite works, roles enforced, real-time sync works

### Tahap 11: Landing Page, SEO & Polish
**Input:** Tahap 7 selesai
**Output:** Aplikasi polished, SEO-ready
**Tasks:**
- Buat landing page (hero, features, CTA, footer)
- Setup SEO meta tags (`useHead()`, OG tags)
- Implementasi loading states (skeleton loaders)
- Implementasi error handling (error.vue, 404, toasts)
- Responsive audit
- Accessibility audit (WCAG AA)
- Performance audit (Lighthouse)
**Done:** Landing page live, Core Web Vitals pass, responsive, accessible

### Tahap 12: Testing E2E & Deployment
**Input:** Tahap 11 selesai
**Output:** Aplikasi deployed dan dimonitor
**Tasks:**
- Buat Playwright E2E test suite (full user journey)
- Setup GitHub Actions CI/CD (lint, typecheck, test, build, deploy)
- Deploy ke staging
- Deploy ke production
- Setup monitoring (Sentry, analytics)
- Buat README.md dan CONTRIBUTING.md
**Done:** E2E pass, CI/CD green, production live, monitoring aktif

---

## Perintah Penting

```bash
# Development
pnpm dev                          # Start dev server
pnpm build                        # Build for production
pnpm preview                      # Preview production build

# Testing
pnpm test                         # Run Vitest unit tests
pnpm test:e2e                     # Run Playwright E2E tests
pnpm test:coverage                # Run tests with coverage

# Code Quality
pnpm lint                         # ESLint check
pnpm lint:fix                     # ESLint auto-fix
pnpm typecheck                    # Nuxt TypeScript check

# Supabase
pnpm supabase:gen-types           # Generate TS types from Supabase schema
```

---

## Environment Variables

```env
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Opsional
SUPABASE_SERVICE_KEY=your-service-key  # Hanya untuk server-side admin operations
```

**JANGAN** commit `.env` ke git. Gunakan `.env.example` sebagai template.

---

## Aturan Penting untuk AI Agent

1. **Selalu ikuti Clean Architecture** — jangan shortcut dengan menaruh Supabase calls langsung di components
2. **TypeScript strict** — jangan pakai `any`, selalu type parameters dan returns
3. **Test setiap tahap** — jangan lanjut ke tahap berikutnya sebelum done criteria terpenuhi
4. **Bahasa kode = English** — variabel, function, komentar dalam bahasa Inggris
5. **Bahasa UI = Indonesia** — semua teks yang terlihat user dalam Bahasa Indonesia
6. **Gunakan Nuxt conventions** — auto-imports, file-based routing, `<script setup>`
7. **Handle errors** — setiap Supabase call HARUS handle error case
8. **RLS selalu aktif** — jangan pernah disable RLS, bahkan untuk development
9. **Responsive dari awal** — setiap komponen harus bekerja di mobile dan desktop
10. **Commit per tahap** — setiap tahap selesai = 1 commit dengan message yang jelas
