const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inscriptionTrancheController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/tranche/:tranche_id', auth, ctrl.getByTranche);
router.get('/membre/:membre_id', auth, ctrl.getByMembre);
router.post('/', auth, ctrl.create);
router.delete('/:id', auth, ctrl.delete);
router.post('/:id/valider', auth, role(['responsable','sous-admin']), ctrl.valider);

module.exports = router;
