const express = require('express');
const router = express.Router();

// Import des sous-routeurs
const authRoutes = require('./authRoutes');
const membreRoutes = require('./membreRoutes');
const evenementRoutes = require('./evenementRoutes');
const articleRoutes = require('./articleRoutes');
const categorieRoutes = require('./categorieRoutes');
const trancheRoutes = require('./trancheRoutes');
const inscriptionTrancheRoutes = require('./inscriptionTrancheRoutes');
const badgeRoutes = require('./badgeRoutes');
const tenantRoutes = require('./tenantRoutes');

router.use('/auth', authRoutes);
router.use('/membres', membreRoutes);
router.use('/evenements', evenementRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categorieRoutes);
router.use('/tranches', trancheRoutes);
router.use('/inscriptions', inscriptionTrancheRoutes);
router.use('/badges', badgeRoutes);
router.use('/tenants', tenantRoutes);

module.exports = router;
