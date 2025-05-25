const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const validateAuth = require("../middlewares/validateAuth");

router.get("/pending-members", validateAuth, adminController.getPendingMembers);

router.post("/validate-member", validateAuth, adminController.validateMember);

router.post("/reject-member", validateAuth, adminController.rejectMember);

module.exports = router;
