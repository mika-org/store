Berikut prompt yang bisa kamu gunakan di AI coding assistant (ChatGPT, Codex, Claude, Gemini, Cursor, Windsurf, dll.) untuk membuat aplikasi toko baju menggunakan **Next.js + Supabase**.

---

# Prompt

Buatkan aplikasi **E-Commerce Toko Baju** yang modern menggunakan teknologi berikut:

### Tech Stack

* Next.js 15 (App Router)
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* Supabase
* Supabase Auth
* Supabase Storage
* PostgreSQL (Supabase)
* TanStack Query
* Zustand (Cart)
* React Hook Form
* Zod Validation
* Lucide Icons

Gunakan clean architecture, reusable components, responsive design, dan best practice.

---

## Fitur Authentication

Implementasikan Supabase Auth.

Halaman:

* Login
* Register
* Forgot Password
* Reset Password
* Profile

Role:

* Admin
* Customer

Admin dapat mengelola seluruh data.
Customer hanya dapat berbelanja.

---

## Database

Buat schema Supabase berikut.

### categories

* id (uuid)
* name
* slug
* image
* created_at

---

### products

* id
* category_id
* name
* slug
* description
* price
* stock
* gender
* size
* color
* image
* is_active
* created_at

---

### product_images

* id
* product_id
* image_url

---

### customers

* id
* auth_id
* full_name
* email
* phone
* address
* city
* province
* postal_code

---

### carts

* id
* customer_id

---

### cart_items

* id
* cart_id
* product_id
* qty

---

### orders

* id
* customer_id
* invoice_number
* total_price
* shipping_cost
* grand_total
* status
* payment_status
* created_at

Status:

* Pending
* Paid
* Packed
* Shipped
* Completed
* Cancelled

---

### order_items

* id
* order_id
* product_id
* qty
* price

---

### payments

* id
* order_id
* payment_method
* payment_proof
* status

---

## Halaman Customer

Landing Page

Berisi:

* Hero Banner
* Promo
* New Arrival
* Best Seller
* Featured Product
* Categories
* Footer

---

Shop

Fitur:

* Search
* Filter kategori
* Filter harga
* Filter ukuran
* Filter warna
* Filter gender
* Sort terbaru
* Sort termurah
* Sort termahal

Pagination.

---

Product Detail

Menampilkan:

* Multiple Images
* Nama Produk
* Harga
* Rating
* Deskripsi
* Pilihan ukuran
* Pilihan warna
* Stock
* Related Product

Button:

* Add to Cart
* Buy Now

---

Cart

Menampilkan:

* List Produk
* Qty
* Remove Item
* Update Qty
* Subtotal

---

Checkout

Form:

* Nama
* Nomor HP
* Alamat
* Kota
* Provinsi
* Kode Pos

Ringkasan Pesanan.

---

Order History

Menampilkan:

* Invoice
* Status
* Detail Pesanan

---

Profile

Customer dapat mengubah:

* Nama
* Email
* Password
* Foto Profil
* Alamat

---

## Dashboard Admin

Sidebar:

* Dashboard
* Categories
* Products
* Orders
* Customers
* Reports
* Settings

---

Dashboard

Menampilkan:

Cards:

* Total Produk
* Total Order
* Total Customer
* Revenue

Chart:

* Penjualan Bulanan
* Produk Terlaris

Recent Orders

---

Category CRUD

Fitur:

* Create
* Edit
* Delete
* Search

---

Product CRUD

Field:

* Nama
* Kategori
* Harga
* Stock
* Deskripsi
* Size
* Color
* Image Upload
* Active

Upload gambar ke Supabase Storage.

---

Order Management

Admin dapat:

* Melihat order
* Mengubah status
* Melihat pembayaran
* Mengunduh invoice

---

Customer Management

Admin dapat melihat daftar customer.

---

Report

Filter:

* Harian
* Bulanan
* Tahunan

Export:

* PDF
* Excel

---

## UI Design

Gunakan desain modern seperti Shopify.

Tema:

* Putih
* Hitam
* Abu-abu

Card memiliki shadow ringan.

Button rounded.

Responsive.

Dark mode.

Loading skeleton.

Toast notification.

Empty state.

Error state.

Confirmation dialog.

---

## Folder Structure

Gunakan struktur seperti berikut:

```
app/
components/
features/
hooks/
lib/
services/
types/
store/
utils/
supabase/
middleware.ts
```

---

## Supabase

Gunakan:

* Server Components
* Server Actions
* Middleware Auth
* Row Level Security
* Storage Bucket untuk gambar produk
* Environment Variables
* Database Migration

---

## Keamanan

Implementasikan:

* Zod Validation
* Server-side Validation
* CSRF Protection
* RLS Policy
* Rate Limiting
* Secure Cookies

---

## SEO

Tambahkan:

* Metadata
* Open Graph
* Sitemap
* Robots
* Dynamic Metadata

---

## Performance

Optimasi:

* Lazy Loading
* Image Optimization
* Pagination
* Infinite Scroll (opsional)
* Caching
* Suspense
* Streaming

---

## Output yang Diharapkan

Hasil akhir harus berupa aplikasi production-ready dengan:

* Struktur project yang rapi
* Kode TypeScript yang bersih
* Komponen reusable
* Database Supabase lengkap
* SQL migration
* RLS policy
* Dokumentasi instalasi
* File `.env.example`
* Seed data contoh
* README lengkap
* Siap dijalankan menggunakan `npm install` dan `npm run dev`

Bangun aplikasi secara bertahap (step-by-step), dimulai dari inisialisasi project, konfigurasi Supabase, pembuatan database, autentikasi, lalu implementasi fitur hingga deployment. Jangan melewati langkah apa pun dan sertakan kode lengkap untuk setiap file yang dibuat atau diubah.
