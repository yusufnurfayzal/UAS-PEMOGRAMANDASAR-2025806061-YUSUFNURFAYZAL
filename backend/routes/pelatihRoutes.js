const express = require('express');
const router = express.Router();
const pelatihController = require('../controllers/pelatihController');

router.get('/', pelatihController.getAllPelatih);
router.get('/:id', pelatihController.getPelatihById);
router.post('/', pelatihController.createPelatih);
router.put('/:id', pelatihController.updatePelatih);
router.delete('/:id', pelatihController.deletePelatih);

module.exports = router;
