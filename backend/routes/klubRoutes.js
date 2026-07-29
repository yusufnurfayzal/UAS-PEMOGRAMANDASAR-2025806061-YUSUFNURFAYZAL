const express = require('express');
const router = express.Router();
const klubController = require('../controllers/klubController');

router.get('/', klubController.getAllKlub);
router.get('/:id', klubController.getKlubById);
router.post('/', klubController.createKlub);
router.put('/:id', klubController.updateKlub);
router.delete('/:id', klubController.deleteKlub);

module.exports = router;
