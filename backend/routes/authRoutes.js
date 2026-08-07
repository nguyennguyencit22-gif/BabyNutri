const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const firebaseAuth = require("../middleware/firebaseAuthMiddleware");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/firebase-login", firebaseAuth, authController.firebaseLogin);

module.exports = router;