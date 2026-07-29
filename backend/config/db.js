const mysql = require('mysql2');
require('dotenv').config();

// Membuat connection pool agar koneksi ke database lebih efisien
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_club_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Menggunakan versi promise agar bisa memakai async/await di controller
const db = pool.promise();

// Cek koneksi saat aplikasi pertama kali dijalankan
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Gagal terhubung ke database:', err.message);
        return;
    }
    console.log('✅ Berhasil terhubung ke database MySQL (sports_club_db)');
    connection.release();
});

module.exports = db;
