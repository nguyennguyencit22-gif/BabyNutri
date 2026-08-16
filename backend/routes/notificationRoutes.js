const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    getNotifications,
    getUnreadCount,
    markAllRead,
} = require("../controllers/notificationController");

router.use(auth);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/read-all", markAllRead);

module.exports = router;
