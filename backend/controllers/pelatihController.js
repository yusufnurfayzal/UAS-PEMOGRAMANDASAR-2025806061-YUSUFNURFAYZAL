const db = require('../config/db');

exports.getAllPelatih = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pelatih ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPelatihById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pelatih WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pelatih tidak ditemukan' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createPelatih = async (req, res) => {
    try {
        const { nama, spesialisasi, no_telp, email } = req.body;
        if (!nama || !spesialisasi || !no_telp) {
            return res.status(400).json({ success: false, message: 'Nama, spesialisasi, dan no_telp wajib diisi' });
        }
        const [result] = await db.query(
            'INSERT INTO pelatih (nama, spesialisasi, no_telp, email) VALUES (?, ?, ?, ?)',
            [nama, spesialisasi, no_telp, email || null]
        );
        res.status(201).json({ success: true, message: 'Pelatih berhasil ditambahkan', data: { id: result.insertId, ...req.body } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePelatih = async (req, res) => {
    try {
        const { nama, spesialisasi, no_telp, email } = req.body;
        if (!nama || !spesialisasi || !no_telp) {
            return res.status(400).json({ success: false, message: 'Nama, spesialisasi, dan no_telp wajib diisi' });
        }
        const [result] = await db.query(
            'UPDATE pelatih SET nama=?, spesialisasi=?, no_telp=?, email=? WHERE id=?',
            [nama, spesialisasi, no_telp, email || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pelatih tidak ditemukan' });
        }
        res.json({ success: true, message: 'Pelatih berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deletePelatih = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM pelatih WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pelatih tidak ditemukan' });
        }
        res.json({ success: true, message: 'Pelatih berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
