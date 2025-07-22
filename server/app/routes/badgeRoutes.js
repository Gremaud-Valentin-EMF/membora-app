const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');

router.get('/membre/:membre_id', auth, badgeController.getByMembre);
router.post('/', auth, role(['responsable','sous-admin']), badgeController.create);

module.exports = router;
