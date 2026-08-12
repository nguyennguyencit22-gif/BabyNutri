const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    createOrPromoteExpert,
    getExperts,
    demoteExpert,
    getReports
} = require("../controllers/adminController");

router.use(auth);

router.post("/experts", createOrPromoteExpert);
router.get("/experts", getExperts);
router.delete("/experts/:id", demoteExpert);
router.get("/reports", getReports);

module.exports = router;
