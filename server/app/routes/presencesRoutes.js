const express = require("express");
const router = express.Router();
const presenceController = require("../controllers/presenceController");
const validateAuth = require("../middlewares/validateAuth");

router.post("/", validateAuth, presenceController.markPresence);

router.delete("/", validateAuth, presenceController.deletePresence);

router.get("/", validateAuth, presenceController.getPresences);

module.exports = router;
