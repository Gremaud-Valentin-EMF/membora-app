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
const badgeRoutes = require("./badgeRoutes");
const trancheRoutes = require("./trancheRoutes");
const eventCategoryRoutes = require("./eventCategoryRoutes");

router.use("/auth", authRoutes);
router.use("/membres", membreRoutes);
router.use("/evenements", evenementRoutes);
router.use("/articles", articleRoutes);
router.use("/categories", categorieRoutes);
router.use("/participations", participationRoutes);
router.use("/tenants", tenantRoutes);
router.use("/badges", badgeRoutes);
router.use("/tranches", trancheRoutes);
router.use("/event-categories", eventCategoryRoutes);

module.exports = router;
