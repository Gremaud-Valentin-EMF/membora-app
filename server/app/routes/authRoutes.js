const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validateAuth = require("../middlewares/validateAuth");

router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/me", validateAuth, authController.getConnectedUser);

module.exports = router;
