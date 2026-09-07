# [Feature] API Get Current User & Table Sessions

## 1. Deskripsi Fitur
Membuat endpoint `GET /api/users/current` untuk mendapatkan profil data user yang saat ini sedang login berdasarkan token autentikasi yang tersimpan di table `sessions`.

---

## 2. Spesifikasi Database Table

### Table `sessions`
File lokasi: `src/db/schema.ts`

Pastikan table `sessions` didefinisikan dengan struktur berikut:
- `id`: integer, primary key, auto increment
- `token`: varchar(255), not null (berisi UUID token login)
- `user_id`: integer, foreign key references ke `users.id`
- `created_at`: timestamp, default `CURRENT_TIMESTAMP`

Contoh definisi di `src/db/schema.ts` (Drizzle ORM MySQL):
```typescript
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 255 }).notNull(),
  userId: int("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

> **Catatan untuk LLM**: Cek file `src/db/schema.ts`. Jika definisi table `sessions` sudah ada, verifikasi kolomnya. Jika belum ada atau perlu disinkronkan ke database, jalankan perintah `bun run db:push`.

---

## 3. Spesifikasi API

### Endpoint: `GET /api/users/current`

#### Request Headers:
```http
Authorization: Bearer <token>
```
*Keterangan: `<token>` adalah token UUID session yang valid yang didapatkan saat login dari tabel `sessions`.*

#### Response Body (Success - HTTP 200):
```json
{
  "data": {
    "id": 1,
    "name": "Ricky",
    "email": "ricky@localhost",
    "created_at": "2026-09-07T00:00:00.000Z"
  }
}
```
*PENTING: Jangan sertakan field `password` di response!*

#### Response Body (Error / Unauthorized - HTTP 401 atau format):
Jika header `Authorization` tidak dikirim, format tidak sesuai (tidak ada prefix `Bearer `), atau token tidak ditemukan/tidak valid di database:
```json
{
  "data": "Unauthorized"
}
```

---

## 4. Struktur Folder dan File

Patuhi struktur folder dan penamaan file berikut di dalam `src`:
```text
src/
├── db/
│   ├── index.ts
│   └── schema.ts           # Definisi schema users dan sessions
├── routes/
│   └── users-route.ts      # Routing Elysia.js untuk user (GET /current)
├── services/
│   └── users-service.ts    # Business logic (getCurrentUser)
└── index.ts                # Entry point aplikasi
```

- **Routes**: Menggunakan suffix `-route.ts` (contoh: `src/routes/users-route.ts`).
- **Services**: Menggunakan suffix `-service.ts` (contoh: `src/services/users-service.ts`).

---

## 5. Tahapan Implementasi Detail (Panduan untuk LLM)

Ikuti tahapan berikut secara berurutan:

### Tahap 1: Verifikasi & Konfigurasi Tabel `sessions`
1. Buka `src/db/schema.ts`.
2. Pastikan table `sessions` sudah ada dengan kolom:
   - `id`: integer autoincrement primary key
   - `token`: varchar 255 not null
   - `userId`: int `user_id` not null referencing `users.id`
   - `createdAt`: timestamp `created_at` defaultNow
3. Jika ada perubahan schema, sinkronkan ke database dengan menjalankan `bun run db:push`.

### Tahap 2: Implementasi Service di `src/services/users-service.ts`
1. Buka `src/services/users-service.ts`.
2. Buat fungsi baru bernama `getCurrentUser(token: string)`:
   - Query tabel `sessions` berdasarkan kolom `token`.
   - Jika session tidak ditemukan: return `{ data: "Unauthorized" }`.
   - Ambil `userId` dari session.
   - Query tabel `users` berdasarkan `id` sama dengan `userId`.
   - Jika user tidak ditemukan: return `{ data: "Unauthorized" }`.
   - Ambil user data dan buat object data tanpa field `password`:
     ```typescript
     return {
       data: {
         id: user.id,
         name: user.name,
         email: user.email,
         created_at: user.createdAt,
       },
     };
     ```
3. Export fungsi `getCurrentUser` agar dapat digunakan di route.

### Tahap 3: Implementasi Route di `src/routes/users-route.ts`
1. Buka `src/routes/users-route.ts`.
2. Import fungsi `getCurrentUser` dari `../services/users-service`.
3. Tambahkan route handler `.get("/current", ...)` pada instance `usersRoute`:
   - Ambil header dari request context: `{ headers, set }`.
   - Ambil nilai `authHeader = headers["authorization"] || headers.authorization`.
   - Validasi ketersediaan header:
     - Jika `authHeader` tidak ada atau tidak diawali dengan `"Bearer "`:
       - Set `set.status = 401`.
       - Return `{ data: "Unauthorized" }`.
   - Ekstrak token:
     ```typescript
     const token = authHeader.replace(/^Bearer\s+/i, "").trim();
     ```
   - Panggil `const result = await getCurrentUser(token)`.
   - Jika `result.data === "Unauthorized"`, set `set.status = 401`.
   - Return `result`.

### Tahap 4: Pengujian & Verifikasi
1. Jalankan aplikasi menggunakan `bun run dev` atau jalankan test dengan `bun test`.
2. Lakukan pengujian skenario berikut:
   - **Skenario 1 (Sukses)**:
     - Lakukan `POST /api/users/login` dengan kredensial valid untuk memperoleh `token`.
     - Request `GET /api/users/current` dengan header `Authorization: Bearer <token>`.
     - Verifikasi response status 200 dan data user (id, name, email, created_at) tampil tanpa password.
   - **Skenario 2 (Gagal - Tanpa Token)**:
     - Request `GET /api/users/current` tanpa header Authorization.
     - Verifikasi response `{ "data": "Unauthorized" }`.
   - **Skenario 3 (Gagal - Token Invalid)**:
     - Request `GET /api/users/current` dengan header `Authorization: Bearer token-ngawur`.
     - Verifikasi response `{ "data": "Unauthorized" }`.
