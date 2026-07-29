const db = require('../config/db');

// GET semua anggota (mendukung search sederhana lewat query ?search=)
exports.getAllAnggota = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = 'SELECT * FROM anggota';
        let params = [];

        if (search) {
            sql += ' WHERE nama LIKE ? OR email LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }
        sql += ' ORDER BY id DESC';

        const [rows] = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET anggota by ID
exports.getAnggotaById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM anggota WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST tambah anggota baru
exports.createAnggota = async (req, res) => {
    try {
        const { nama, email, no_telp, tanggal_lahir, alamat, tanggal_gabung } = req.body;

        // Validasi field wajib
        if (!nama || !email || !no_telp) {
            return res.status(400).json({ success: false, message: 'Nama, email, dan no_telp wajib diisi' });
        }
        // Validasi format email sederhana
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Format email tidak valid' });
        }

        const [result] = await db.query(
            'INSERT INTO anggota (nama, email, no_telp, tanggal_lahir, alamat, tanggal_gabung) VALUES (?, ?, ?, ?, ?, ?)',
            [nama, email, no_telp, tanggal_lahir || null, alamat || null, tanggal_gabung || new Date()]
        );
        res.status(201).json({ success: true, message: 'Anggota berhasil ditambahkan', data: { id: result.insertId, ...req.body } });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT update anggota
exports.updateAnggota = async (req, res) => {
    try {
        const { nama, email, no_telp, tanggal_lahir, alamat, tanggal_gabung } = req.body;

        if (!nama || !email || !no_telp) {
            return res.status(400).json({ success: false, message: 'Nama, email, dan no_telp wajib diisi' });
        }

        const [result] = await db.query(
            'UPDATE anggota SET nama = ?, email = ?, no_telp = ?, tanggal_lahir = ?, alamat = ?, tanggal_gabung = ? WHERE id = ?',
            [nama, email, no_telp, tanggal_lahir || null, alamat || null, tanggal_gabung || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
        }
        res.json({ success: true, message: 'Anggota berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE anggota
exports.deleteAnggota = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM anggota WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan' });
        }
        res.json({ success: true, message: 'Anggota berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
