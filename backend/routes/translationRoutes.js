// routes/translationRoutes.js

const express = require('express');

const {
    translateContent,
} = require('../controllers/translationController');

const router = express.Router();

router.post('/', translateContent);

module.exports = router;