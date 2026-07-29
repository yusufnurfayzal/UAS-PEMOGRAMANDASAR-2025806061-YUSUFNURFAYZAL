const db = require('../config/db');

// GET semua klub (join dengan pelatih agar nama pelatih ikut tampil)
exports.getAllKlub = async (req, res) => {
    try {
        const { search, kategori } = req.query;
        let sql = `
            SELECT klub.*, pelatih.nama AS nama_pelatih
            FROM klub
            LEFT JOIN pelatih ON klub.pelatih_id = pelatih.id
            WHERE 1 = 1
        `;
        const params = [];

        if (search) {
            sql += ' AND klub.nama_klub LIKE ?';
            params.push(`%${search}%`);
        }
        if (kategori) {
            sql += ' AND klub.kategori_olahraga = ?';
            params.push(kategori);
        }
        sql += ' ORDER BY klub.id DESC';

        const [rows] = await db.query(sql, params);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET klub by ID
exports.getKlubById = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT klub.*, pelatih.nama AS nama_pelatih
             FROM klub LEFT JOIN pelatih ON klub.pelatih_id = pelatih.id
             WHERE klub.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Klub tidak ditemukan' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST tambah klub baru
exports.createKlub = async (req, res) => {
    try {
        const { nama_klub, kategori_olahraga, pelatih_id, kuota, jadwal_latihan, deskripsi } = req.body;

        if (!nama_klub || !kategori_olahraga) {
            return res.status(400).json({ success: false, message: 'Nama klub dan kategori olahraga wajib diisi' });
        }

        const [result] = await db.query(
            'INSERT INTO klub (nama_klub, kategori_olahraga, pelatih_id, kuota, jadwal_latihan, deskripsi) VALUES (?, ?, ?, ?, ?, ?)',
            [nama_klub, kategori_olahraga, pelatih_id || null, kuota || 20, jadwal_latihan || null, deskripsi || null]
        );
        res.status(201).json({ success: true, message: 'Klub berhasil ditambahkan', data: { id: result.insertId, ...req.body } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT update klub
exports.updateKlub = async (req, res) => {
    try {
        const { nama_klub, kategori_olahraga, pelatih_id, kuota, jadwal_latihan, deskripsi } = req.body;

        if (!nama_klub || !kategori_olahraga) {
            return res.status(400).json({ success: false, message: 'Nama klub dan kategori olahraga wajib diisi' });
        }

        const [result] = await db.query(
            'UPDATE klub SET nama_klub=?, kategori_olahraga=?, pelatih_id=?, kuota=?, jadwal_latihan=?, deskripsi=? WHERE id=?',
            [nama_klub, kategori_olahraga, pelatih_id || null, kuota || 20, jadwal_latihan || null, deskripsi || null, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Klub tidak ditemukan' });
        }
        res.json({ success: true, message: 'Klub berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE klub
exports.deleteKlub = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM klub WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Klub tidak ditemukan' });
        }
        res.json({ success: true, message: 'Klub berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
