# PocketFirewall — Project Specification

## Overview

Personal budgeting web app (PWA) for tracking daily income and expenses. Mobile-first, installable to Android home screen, with monthly summary, charts, and PDF export stored to Vercel Blob.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Neon (PostgreSQL serverless) |
| ORM | Prisma |
| Auth | Better Auth (Google OAuth) |
| Storage | Vercel Blob (PDF reports) |
| Deploy | Vercel |
| PWA | next-pwa |

---

## Project Structure

```
pocketfirewall/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard utama
│   │   ├── transactions/
│   │   │   └── page.tsx              # List semua transaksi
│   │   ├── categories/
│   │   │   └── page.tsx              # Manage kategori custom
│   │   └── reports/
│   │       └── page.tsx              # Monthly report + export PDF
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── transactions/
│   │   │   └── route.ts              # GET, POST
│   │   ├── transactions/[id]/
│   │   │   └── route.ts              # PATCH, DELETE
│   │   ├── categories/
│   │   │   └── route.ts              # GET, POST
│   │   ├── summary/
│   │   │   └── route.ts              # GET monthly summary
│   │   └── reports/
│   │       └── generate/
│   │           └── route.ts          # POST — generate + upload PDF ke Vercel Blob
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── transaction-form.tsx          # Form input transaksi (minimal, mobile-first)
│   ├── transaction-list.tsx
│   ├── category-picker.tsx           # Tap-based, bukan dropdown
│   ├── monthly-summary.tsx
│   ├── monthly-chart.tsx             # Bar chart pemasukan vs pengeluaran
│   ├── report-export-button.tsx      # Tombol generate + download PDF, bisa trigger kapan saja
├── lib/
│   ├── auth.ts                       # Auth.js config
│   ├── db.ts                         # Prisma client singleton
│   ├── blob.ts                       # Vercel Blob helpers
│   └── pdf.ts                        # PDF generation logic
├── prisma/
│   └── schema.prisma
├── public/
│   ├── manifest.json                 # PWA manifest
│   └── icons/                        # PWA icons (192x192, 512x512)
├── next.config.ts
└── middleware.ts                     # Auth guard
```

---

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(cuid())
  name          String?
  email         String        @unique
  image         String?
  createdAt     DateTime      @default(now())
  transactions  Transaction[]
  categories    Category[]
  reports       Report[]
}

model Transaction {
  id         String          @id @default(cuid())
  userId     String
  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  amount     Decimal         @db.Decimal(12, 2)
  type       TransactionType
  categoryId String
  category   Category        @relation(fields: [categoryId], references: [id])
  note       String?
  date       DateTime        @default(now())
  createdAt  DateTime        @default(now())

  @@index([userId, date])
}

model Category {
  id           String          @id @default(cuid())
  userId       String?         // null = predefined/global
  user         User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  type         TransactionType
  isDefault    Boolean         @default(false)
  transactions Transaction[]

  @@unique([userId, name, type])
}

model Report {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  month     Int      // 1-12
  year      Int
  blobUrl   String   // Vercel Blob URL
  createdAt DateTime @default(now())

  @@unique([userId, month, year])
}

enum TransactionType {
  INCOME
  EXPENSE
}
```

---

## Seed Data — Predefined Categories

Seed ini harus dijalankan saat `prisma db seed`. Kategori predefined memiliki `userId = null` dan `isDefault = true`.

```ts
// prisma/seed.ts
const expenseCategories = ['Makan', 'Transport', 'Kesehatan', 'Belanja', 'Hiburan', 'Tagihan', 'Lainnya']
const incomeCategories = ['Gaji', 'Freelance', 'Investasi', 'Lainnya']
```

---

## Authentication

Gunakan **Better Auth** dengan Google OAuth provider. Better Auth auto-generate schema tabel auth (user, session, account, verification) — tidak perlu didefinisikan manual di Prisma schema.

Jalankan perintah berikut setelah install untuk sync schema ke database:
```bash
pnpm dlx better-auth migrate
```

```ts
// lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './db'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  }
})
```

```ts
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL!
})
```

```ts
// app/api/auth/[...all]/route.ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

```ts
// middleware.ts — proteksi semua route kecuali /login dan /api/auth
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(request: NextRequest) {
  const session = getSessionCookie(request)
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|login|_next|favicon.ico).*)']
}
```

Untuk mengambil session di server component:
```ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
```

Environment variables yang dibutuhkan:
```
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=
```

---

## API Routes

### `GET /api/transactions`
Query params: `month` (1-12), `year` (YYYY)
Returns: array of transactions with category populated

### `POST /api/transactions`
Body: `{ amount, type, categoryId, note?, date? }`

### `PATCH /api/transactions/[id]`
Body: partial transaction fields

### `DELETE /api/transactions/[id]`

### `GET /api/categories`
Query params: `type` (INCOME | EXPENSE)
Returns: predefined categories + user's custom categories

### `POST /api/categories`
Body: `{ name, type }`
Hanya bisa membuat kategori dengan type INCOME atau EXPENSE, userId diambil dari session.

### `GET /api/summary`
Query params: `month`, `year`
Returns:
```json
{
  "totalIncome": 0,
  "totalExpense": 0,
  "balance": 0,
  "byCategory": [
    { "categoryName": "Makan", "type": "EXPENSE", "total": 0 }
  ]
}
```

### `POST /api/reports/generate`
Body: `{ month, year }`

Endpoint ini bisa dipanggil dua cara:
- **Manual** — dari tombol "Generate & Export PDF" di halaman Reports, bisa kapan saja (tidak harus akhir bulan)
- **Otomatis** — dipanggil oleh cron job setiap akhir bulan

Flow:
1. Ambil semua transaksi bulan tersebut dari DB
2. Generate PDF (gunakan `@react-pdf/renderer` atau `puppeteer`)
3. Upload ke Vercel Blob dengan path `reports/{userId}/{year}-{month}.pdf`
4. Upsert record ke tabel `Report`
5. Return `{ blobUrl }`

---

## PDF Report Format

Konten per halaman:

```
PocketFirewall — Laporan Bulan [Nama Bulan] [Tahun]

RINGKASAN
Total Pemasukan : Rp X
Total Pengeluaran: Rp X
Saldo Akhir     : Rp X

PENGELUARAN PER KATEGORI
[Tabel: Kategori | Total | % dari pengeluaran]

DAFTAR TRANSAKSI
[Tabel: Tanggal | Kategori | Catatan | Jumlah]
```

Gunakan `@react-pdf/renderer` untuk generate PDF di server (kompatibel dengan Vercel serverless).

---

## PWA Configuration

```json
// public/manifest.json
{
  "name": "PocketFirewall",
  "short_name": "PocketFW",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```ts
// next.config.ts
import withPWA from 'next-pwa'

const config = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})({
  // next config
})

export default config
```

---

## UI/UX — Transaction Form (Mobile-First)

Form input transaksi harus se-minimal dan se-cepat mungkin. Prioritas:

1. **Toggle INCOME / EXPENSE** — dua tombol besar di atas, bukan dropdown
2. **Input nominal** — angka keyboard langsung muncul (`inputMode="numeric"`)
3. **Category picker** — grid tombol tap, bukan `<select>`. Tampilkan semua kategori sesuai type yang dipilih. Jika user tap "Lainnya", muncul input field untuk nama kategori baru
4. **Catatan** — optional, satu baris
5. **Tanggal** — default hari ini, bisa diubah
6. **Submit** — satu tombol besar

Tidak ada multi-step wizard. Semua dalam satu layar yang bisa discroll.

---

## Monthly Chart

Gunakan `recharts` (sudah tersedia di ekosistem shadcn).

Chart yang ditampilkan: **Bar chart** dengan dua bar per bulan (Pemasukan vs Pengeluaran), tampilkan 6 bulan terakhir sebagai context.

---

## In-App Notification — Generate PDF

Tidak ada cron job. Notifikasi ditampilkan murni di frontend saat user membuka halaman Reports.

Kondisi notifikasi muncul:
1. Hari ini adalah hari terakhir bulan ini, **DAN**
2. Report bulan ini belum pernah di-generate (cek dari tabel `Report`)

```ts
// lib/report-notification.ts
export function isLastDayOfMonth(): boolean {
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return today.getDate() === lastDay
}
```

Di halaman Reports, fetch status report bulan ini dari DB. Jika `isLastDayOfMonth() === true` dan record belum ada, tampilkan banner:

```tsx
{showBanner && (
  <div className="..."> // shadcn Alert component
    Hari ini akhir bulan. Laporan bulan ini belum di-generate.
    <Button onClick={handleGenerate}>Generate Sekarang</Button>
  </div>
)}
```

Setelah user klik generate dan berhasil, banner hilang otomatis karena record sudah ada di DB.

---

## Deployment Checklist

1. Push ke GitHub
2. Connect ke Vercel
3. Set semua environment variables di Vercel dashboard
4. Jalankan `pnpm prisma migrate deploy` via Vercel build command atau manual
5. Jalankan `pnpm prisma db seed` untuk predefined categories
6. Test install PWA di Android Chrome

---

## Dependencies

```bash
# Install dependencies
pnpm add next@^16.2.6 react@^19 better-auth @prisma/client @vercel/blob @react-pdf/renderer recharts next-pwa

# Install dev dependencies
pnpm add -D prisma typescript @types/react @types/node tailwindcss@^4 shadcn
```