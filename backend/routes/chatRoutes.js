const express = require("express");
const router = express.Router();
const {
    getExperts,
    startConversation,
    getMyConversations,
    getMessages,
    sendMessage,
    endConversation,
    rateConversation,
    getMyChatFeedback,
} = require("../controllers/chatController");
const auth = require("../middleware/auth");

router.get("/experts", getExperts);
router.get("/feedback/mine", auth, getMyChatFeedback);

router.post("/conversations", auth, startConversation);
router.get("/conversations", auth, getMyConversations);
router.get("/conversations/:id/messages", auth, getMessages);
router.post("/conversations/:id/messages", auth, sendMessage);
router.post("/conversations/:id/end", auth, endConversation);
router.post("/conversations/:id/rating", auth, rateConversation);

module.exports = router;
