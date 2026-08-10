const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    activateInvitation,
} = require("../controllers/childInvitationController");

router.post("/activate", auth, activateInvitation);

module.exports = router;
