const express = require("express");
const router = express.Router();
const permissionController = require("../controllers/permissionController");
const validateAuth = require("../middlewares/validateAuth");

router.get("/", validateAuth, permissionController.getPermissionsByUser);

router.post("/", validateAuth, permissionController.grantRightOnCategorie);

module.exports = router;
