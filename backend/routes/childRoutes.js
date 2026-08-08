
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
    getChildren,
    createChild,
    updateChild,
    deleteChild,
} = require("../controllers/childController");

router.get("/", auth, getChildren);
router.post("/", auth, createChild);
router.put("/:id", auth, updateChild);
router.delete("/:id", auth, deleteChild);


module.exports = router;
