const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
router.use("/auth", authRoutes);

const membresRoutes = require("./membresRoutes");
router.use("/membres", membresRoutes);

const evenementsRoutes = require("./evenementsRoutes");
router.use("/evenements", evenementsRoutes);

const categoriesRoutes = require("./categoriesRoutes");
router.use("/categories", categoriesRoutes);

const permissionsRoutes = require("./permissionsRoutes");
router.use("/permissions", permissionsRoutes);

const presencesRoutes = require("./presencesRoutes");
router.use("/presences", presencesRoutes);

const adminsRoutes = require("./adminsRoutes");
router.use("/admins", adminsRoutes);

module.exports = router;
