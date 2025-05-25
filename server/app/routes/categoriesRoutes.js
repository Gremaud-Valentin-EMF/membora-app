const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController");
const validateAuth = require("../middlewares/validateAuth");

router.get("/", validateAuth, categorieController.getCategories);

router.post("/", validateAuth, categorieController.createCategorie);

router.delete("/:id", validateAuth, categorieController.deleteCategorie);

module.exports = router;
