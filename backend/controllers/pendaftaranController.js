const db = require('../config/db');

// GET semua pendaftaran (join anggota & klub)
exports.getAllPendaftaran = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT pendaftaran.*, anggota.nama AS nama_anggota, klub.nama_klub
            FROM pendaftaran
            JOIN anggota ON pendaftaran.anggota_id = anggota.id
            JOIN klub ON pendaftaran.klub_id = klub.id
            ORDER BY pendaftaran.id DESC
        `);
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPendaftaranById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pendaftaran WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pendaftaran tidak ditemukan' });
        }
        res.json({ success: true, data: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createPendaftaran = async (req, res) => {
    try {
        const { anggota_id, klub_id, tanggal_daftar, status } = req.body;
        if (!anggota_id || !klub_id) {
            return res.status(400).json({ success: false, message: 'Anggota dan klub wajib dipilih' });
        }
        const [result] = await db.query(
            'INSERT INTO pendaftaran (anggota_id, klub_id, tanggal_daftar, status) VALUES (?, ?, ?, ?)',
            [anggota_id, klub_id, tanggal_daftar || new Date(), status || 'Pending']
        );
        res.status(201).json({ success: true, message: 'Pendaftaran berhasil ditambahkan', data: { id: result.insertId, ...req.body } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePendaftaran = async (req, res) => {
    try {
        const { anggota_id, klub_id, tanggal_daftar, status } = req.body;
        if (!anggota_id || !klub_id) {
            return res.status(400).json({ success: false, message: 'Anggota dan klub wajib dipilih' });
        }
        const [result] = await db.query(
            'UPDATE pendaftaran SET anggota_id=?, klub_id=?, tanggal_daftar=?, status=? WHERE id=?',
            [anggota_id, klub_id, tanggal_daftar || null, status || 'Pending', req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pendaftaran tidak ditemukan' });
        }
        res.json({ success: true, message: 'Pendaftaran berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deletePendaftaran = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM pendaftaran WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Pendaftaran tidak ditemukan' });
        }
        res.json({ success: true, message: 'Pendaftaran berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET statistik ringkas untuk dashboard
exports.getStatistik = async (req, res) => {
    try {
        const [[{ totalAnggota }]] = await db.query('SELECT COUNT(*) AS totalAnggota FROM anggota');
        const [[{ totalKlub }]] = await db.query('SELECT COUNT(*) AS totalKlub FROM klub');
        const [[{ totalPelatih }]] = await db.query('SELECT COUNT(*) AS totalPelatih FROM pelatih');
        const [[{ totalPendaftaran }]] = await db.query('SELECT COUNT(*) AS totalPendaftaran FROM pendaftaran');
        const [[{ totalAktif }]] = await db.query("SELECT COUNT(*) AS totalAktif FROM pendaftaran WHERE status = 'Aktif'");

        res.json({
            success: true,
            data: { totalAnggota, totalKlub, totalPelatih, totalPendaftaran, totalAktif }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
