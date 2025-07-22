const express = require('express');
const router = express.Router();
const trancheController = require('../controllers/trancheController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/event/:event_id', auth, trancheController.getByEvent);
router.post('/', auth, role(['responsable','sous-admin']), trancheController.create);
router.put('/:id', auth, role(['responsable','sous-admin']), trancheController.update);
router.delete('/:id', auth, role(['responsable','sous-admin']), trancheController.delete);

module.exports = router;
