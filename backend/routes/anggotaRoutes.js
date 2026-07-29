const express = require('express');
const router = express.Router();
const anggotaController = require('../controllers/anggotaController');

router.get('/', anggotaController.getAllAnggota);
router.get('/:id', anggotaController.getAnggotaById);
router.post('/', anggotaController.createAnggota);
router.put('/:id', anggotaController.updateAnggota);
router.delete('/:id', anggotaController.deleteAnggota);

module.exports = router;
