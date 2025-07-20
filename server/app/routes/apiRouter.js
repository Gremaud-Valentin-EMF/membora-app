const express = require("express");
const router = express.Router();

// Import des sous-routeurs (à créer)
const authRoutes = require("./authRoutes");
const membreRoutes = require("./membreRoutes");
const evenementRoutes = require("./evenementRoutes");
const articleRoutes = require("./articleRoutes");
const categorieRoutes = require("./categorieRoutes");
const participationRoutes = require("./participationRoutes");
const tenantRoutes = require("./tenantRoutes");

router.use("/auth", authRoutes);
router.use("/membres", membreRoutes);
router.use("/evenements", evenementRoutes);
router.use("/articles", articleRoutes);
router.use("/categories", categorieRoutes);
router.use("/participations", participationRoutes);
router.use("/tenants", tenantRoutes);

module.exports = router;
