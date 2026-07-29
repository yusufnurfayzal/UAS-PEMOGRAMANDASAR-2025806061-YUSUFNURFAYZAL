const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const anggotaRoutes = require('./routes/anggotaRoutes');
const klubRoutes = require('./routes/klubRoutes');
const pelatihRoutes = require('./routes/pelatihRoutes');
const pendaftaranRoutes = require('./routes/pendaftaranRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Menyajikan frontend secara statis (opsional, agar bisa diakses lewat 1 server saja)
app.use(express.static(path.join(__dirname, '../frontend')));

// REST API Routes
app.use('/api/anggota', anggotaRoutes);
app.use('/api/klub', klubRoutes);
app.use('/api/pelatih', pelatihRoutes);
app.use('/api/pendaftaran', pendaftaranRoutes);

// Root endpoint untuk cek status API
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Sports Club Management System API is running 🏆',
        endpoints: [
            'GET/POST /api/anggota',
            'GET/PUT/DELETE /api/anggota/:id',
            'GET/POST /api/klub',
            'GET/PUT/DELETE /api/klub/:id',
            'GET/POST /api/pelatih',
            'GET/PUT/DELETE /api/pelatih/:id',
            'GET/POST /api/pendaftaran',
            'GET/PUT/DELETE /api/pendaftaran/:id',
            'GET /api/pendaftaran/statistik'
        ]
    });
});

// Handler 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
