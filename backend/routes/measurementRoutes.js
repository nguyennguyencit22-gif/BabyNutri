const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    getMeasurementSettings,
    updateMeasurementSettings,
} = require("../controllers/measurementController");

router.get("/", auth, getMeasurementSettings);
router.put("/", auth, updateMeasurementSettings);

module.exports = router;
