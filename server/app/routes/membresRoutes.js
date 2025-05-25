const express = require("express");
const router = express.Router();
const membreController = require("../controllers/membreController");
const validateAuth = require("../middlewares/validateAuth");

router.get("/", validateAuth, membreController.getMembres);

router.get("/:id", validateAuth, membreController.getMembreById);

router.post("/", validateAuth, membreController.createMembre);

router.put("/", validateAuth, membreController.editMembre);

router.delete("/", validateAuth, membreController.deleteMembre);

module.exports = router;
