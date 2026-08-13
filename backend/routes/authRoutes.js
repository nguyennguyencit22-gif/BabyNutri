const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const firebaseAuth = require("../middleware/firebaseAuthMiddleware");
const auth = require("../middleware/auth");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/firebase-login", firebaseAuth, authController.firebaseLogin);
router.delete("/me", auth, authController.deleteMyAccount);

module.exports = router;