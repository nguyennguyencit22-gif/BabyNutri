const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    getChildren,
    getChildById,
    createChild,
    updateChild,
    deleteChild,
} = require("../controllers/childController");

const {
    getOrCreateInvitation,
} = require("../controllers/childInvitationController");

router.get("/", auth, getChildren);
router.get("/:id", auth, getChildById);
router.post("/", auth, createChild);
router.put("/:id", auth, updateChild);
router.delete("/:id", auth, deleteChild);
router.post("/:childId/invitations", auth, getOrCreateInvitation);

module.exports = router;
