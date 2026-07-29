# 🏆 ClubBoard — Sports Club Management System

Aplikasi manajemen klub olahraga berbasis web, dibuat untuk memenuhi tugas **UAS Praktik Pemrograman Dasar**.

## Identitas Mahasiswa

| Keterangan | Isi |
|---|---|
| Nama | *(isi nama Anda)* |
| NIM | *(isi NIM Anda)* |
| Kelas | Teknologi Informasi / 2 Pagi |
| Mata Kuliah | Pemrograman Dasar |
| Dosen | Rintis Mardika Sunarto |
| Tema Proyek | Sports Club Management System |

## Deskripsi Singkat Aplikasi

ClubBoard adalah aplikasi manajemen klub olahraga yang memungkinkan admin untuk mengelola data **anggota**, **klub**, **pelatih**, dan **pendaftaran** anggota ke klub tertentu. Aplikasi menampilkan dashboard ringkasan statistik, pencarian & filter data, serta operasi CRUD (Create, Read, Update, Delete) penuh melalui REST API.

## Teknologi yang Digunakan

- **Frontend:** HTML5, CSS3 (Flexbox/Grid, responsive), JavaScript (Fetch API, DOM Manipulation, Async/Await)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Arsitektur:** REST API

## Struktur Project

```
UAS-PemrogramanDasar-NIM-Nama
│
├── backend
│   ├── app.js                     # Entry point server Express
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js                  # Koneksi ke MySQL
│   ├── controllers/
│   │   ├── anggotaController.js
│   │   ├── klubController.js
│   │   ├── pelatihController.js
│   │   └── pendaftaranController.js
│   └── routes/
│       ├── anggotaRoutes.js
│       ├── klubRoutes.js
│       ├── pelatihRoutes.js
│       └── pendaftaranRoutes.js
│
├── frontend
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   └── assets/
│
├── database
│   └── database.sql
│
├── screenshots
│   ├── dashboard.png
│   ├── form.png
│   └── database.png
│
├── README.md
├── .gitignore
└── LICENSE
```

## Fitur Utama

- **Dashboard** — statistik total anggota, klub, pelatih, pendaftaran, dan keanggotaan aktif.
- **Anggota** — CRUD lengkap, pencarian nama/email, pagination.
- **Klub** — CRUD lengkap, pencarian nama, filter kategori olahraga, relasi ke pelatih.
- **Pelatih** — CRUD lengkap.
- **Pendaftaran** — CRUD lengkap sebagai tabel relasi antara anggota dan klub, dilengkapi status (Aktif/Pending/Nonaktif).
- **Bonus:** dark/light mode toggle, toast notification, loading spinner, responsive mobile, hover effect, search & filter, pagination.

## Struktur Database

4 tabel yang saling berelasi:

- `pelatih` — data pelatih.
- `klub` — data klub, berelasi ke `pelatih` (1 pelatih bisa menangani banyak klub).
- `anggota` — data anggota klub.
- `pendaftaran` — tabel relasi many-to-many antara `anggota` dan `klub`, mencatat status keanggotaan.

## Cara Menjalankan Aplikasi

### 1. Persiapan Database

1. Buka XAMPP, jalankan **Apache** dan **MySQL**.
2. Buka **phpMyAdmin** (`http://localhost/phpmyadmin`).
3. Import file `database/database.sql`. Database `sports_club_db` beserta tabel dan data contoh akan otomatis dibuat.

### 2. Menjalankan Backend

```bash
cd backend
npm install
cp .env.example .env
# sesuaikan isi .env dengan konfigurasi MySQL Anda
npm start
```

Server akan berjalan di `http://localhost:3000`.

### 3. Menjalankan Frontend

Frontend sudah otomatis disajikan (served) oleh backend melalui Express static files. Setelah backend berjalan, cukup buka browser dan akses:

```
http://localhost:3000
```

> Alternatif: frontend juga bisa dibuka langsung dengan Live Server dari folder `frontend/`, namun pastikan `API_BASE` di `frontend/js/app.js` menunjuk ke alamat backend yang benar (`http://localhost:3000/api`) apabila diakses dari port berbeda.

## Daftar Endpoint REST API

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/anggota` | Ambil semua anggota (query `?search=`) |
| GET | `/anggota/:id` | Ambil satu anggota |
| POST | `/anggota` | Tambah anggota baru |
| PUT | `/anggota/:id` | Perbarui data anggota |
| DELETE | `/anggota/:id` | Hapus anggota |
| GET | `/klub` | Ambil semua klub (query `?search=`, `?kategori=`) |
| GET | `/klub/:id` | Ambil satu klub |
| POST | `/klub` | Tambah klub baru |
| PUT | `/klub/:id` | Perbarui data klub |
| DELETE | `/klub/:id` | Hapus klub |
| GET | `/pelatih` | Ambil semua pelatih |
| GET | `/pelatih/:id` | Ambil satu pelatih |
| POST | `/pelatih` | Tambah pelatih baru |
| PUT | `/pelatih/:id` | Perbarui data pelatih |
| DELETE | `/pelatih/:id` | Hapus pelatih |
| GET | `/pendaftaran` | Ambil semua data pendaftaran |
| GET | `/pendaftaran/:id` | Ambil satu data pendaftaran |
| POST | `/pendaftaran` | Tambah pendaftaran baru |
| PUT | `/pendaftaran/:id` | Perbarui data pendaftaran |
| DELETE | `/pendaftaran/:id` | Hapus pendaftaran |
| GET | `/pendaftaran/statistik` | Statistik ringkas untuk dashboard |

## Screenshot Aplikasi

*(Tambahkan screenshot dashboard, form tambah/edit data, dan struktur database di folder `screenshots/` lalu tautkan di sini setelah aplikasi dijalankan)*

```markdown
![Dashboard](screenshots/dashboard.png)
![Form](screenshots/form.png)
![Database](screenshots/database.png)
```

## Link Repository GitHub

```
https://github.com/username/UAS-PemrogramanDasar-NIM-Nama
```

*(Ganti dengan link repository Anda setelah proyek diunggah ke GitHub)*
