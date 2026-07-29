-- =========================================================
-- Database: sports_club_db
-- Sports Club Management System
-- UAS Praktik Pemrograman Dasar
-- Cukup import file ini melalui phpMyAdmin/XAMPP
-- =========================================================

CREATE DATABASE IF NOT EXISTS sports_club_db;
USE sports_club_db;

-- =========================================================
-- Tabel: pelatih
-- =========================================================
CREATE TABLE IF NOT EXISTS pelatih (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    spesialisasi VARCHAR(100) NOT NULL,
    no_telp VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- Tabel: klub  (berelasi ke pelatih)
-- =========================================================
CREATE TABLE IF NOT EXISTS klub (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_klub VARCHAR(100) NOT NULL,
    kategori_olahraga VARCHAR(50) NOT NULL,
    pelatih_id INT,
    kuota INT NOT NULL DEFAULT 20,
    jadwal_latihan VARCHAR(100),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pelatih_id) REFERENCES pelatih(id) ON DELETE SET NULL
);

-- =========================================================
-- Tabel: anggota
-- =========================================================
CREATE TABLE IF NOT EXISTS anggota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    no_telp VARCHAR(20) NOT NULL,
    tanggal_lahir DATE,
    alamat TEXT,
    tanggal_gabung DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- Tabel: pendaftaran (relasi many-to-many anggota <-> klub)
-- =========================================================
CREATE TABLE IF NOT EXISTS pendaftaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    anggota_id INT NOT NULL,
    klub_id INT NOT NULL,
    tanggal_daftar DATE DEFAULT (CURRENT_DATE),
    status ENUM('Aktif', 'Pending', 'Nonaktif') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (anggota_id) REFERENCES anggota(id) ON DELETE CASCADE,
    FOREIGN KEY (klub_id) REFERENCES klub(id) ON DELETE CASCADE
);

-- =========================================================
-- Sample Data: pelatih
-- =========================================================
INSERT INTO pelatih (nama, spesialisasi, no_telp, email) VALUES
('Andi Wijaya', 'Sepak Bola', '081234567801', 'andi.wijaya@sportclub.id'),
('Siti Rahma', 'Bulu Tangkis', '081234567802', 'siti.rahma@sportclub.id'),
('Budi Prakoso', 'Basket', '081234567803', 'budi.prakoso@sportclub.id'),
('Dewi Lestari', 'Renang', '081234567804', 'dewi.lestari@sportclub.id');

-- =========================================================
-- Sample Data: klub
-- =========================================================
INSERT INTO klub (nama_klub, kategori_olahraga, pelatih_id, kuota, jadwal_latihan, deskripsi) VALUES
('Garuda FC', 'Sepak Bola', 1, 25, 'Senin & Rabu, 16.00', 'Klub sepak bola untuk pemula hingga tingkat lanjut.'),
('Smash Elite', 'Bulu Tangkis', 2, 20, 'Selasa & Kamis, 17.00', 'Klub bulu tangkis dengan fokus teknik dasar dan turnamen.'),
('Thunder Basketball', 'Basket', 3, 18, 'Rabu & Jumat, 18.00', 'Klub basket kompetitif untuk remaja dan dewasa.'),
('Aqua Swim Team', 'Renang', 4, 15, 'Sabtu, 08.00', 'Klub renang untuk semua level, dari dasar hingga kompetisi.');

-- =========================================================
-- Sample Data: anggota
-- =========================================================
INSERT INTO anggota (nama, email, no_telp, tanggal_lahir, alamat, tanggal_gabung) VALUES
('Rizky Ramadhan', 'rizky.ramadhan@mail.com', '081298765401', '2003-05-12', 'Jl. Kenanga No. 10, Tangerang', '2026-01-10'),
('Anisa Putri', 'anisa.putri@mail.com', '081298765402', '2004-08-21', 'Jl. Melati No. 5, Tangerang', '2026-01-15'),
('Fajar Nugroho', 'fajar.nugroho@mail.com', '081298765403', '2002-11-03', 'Jl. Mawar No. 8, Tangerang', '2026-02-01'),
('Laila Salsabila', 'laila.salsabila@mail.com', '081298765404', '2005-02-17', 'Jl. Anggrek No. 3, Tangerang', '2026-02-14'),
('Yusuf Hidayat', 'yusuf.hidayat@mail.com', '081298765405', '2003-09-29', 'Jl. Dahlia No. 12, Tangerang', '2026-03-05');

-- =========================================================
-- Sample Data: pendaftaran
-- =========================================================
INSERT INTO pendaftaran (anggota_id, klub_id, tanggal_daftar, status) VALUES
(1, 1, '2026-01-11', 'Aktif'),
(2, 2, '2026-01-16', 'Aktif'),
(3, 3, '2026-02-02', 'Pending'),
(4, 2, '2026-02-15', 'Aktif'),
(5, 4, '2026-03-06', 'Nonaktif'),
(1, 3, '2026-03-10', 'Pending');
