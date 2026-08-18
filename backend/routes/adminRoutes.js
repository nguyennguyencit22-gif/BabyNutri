const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
    createOrPromoteExpert,
    getExperts,
    demoteExpert,
    deleteExpert,
    getReports
} = require("../controllers/adminController");

router.use(auth);

router.post("/experts", createOrPromoteExpert);
router.get("/experts", getExperts);
router.delete("/experts/:id", demoteExpert);
router.delete("/experts/:id/permanent", deleteExpert);
router.get("/reports", getReports);

module.exports = router;
