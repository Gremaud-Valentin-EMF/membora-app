const express = require("express");
const router = express.Router();
const evenementController = require("../controllers/evenementController");
const validateAuth = require("../middlewares/validateAuth");

router.get("/", validateAuth, evenementController.getEvenements);

router.get("/:id", validateAuth, evenementController.getEvenementById);

router.post("/", validateAuth, evenementController.createEvenement);

router.put("/", validateAuth, evenementController.editEvenement);

router.delete("/", validateAuth, evenementController.deleteEvenement);

module.exports = router;
