// routes/translationRoutes.js

const express = require('express');

const {
    translateContent,
    translateBatch,
    getSupportedLanguages,
} = require('../controllers/translationController');

const router = express.Router();

router.get('/languages', getSupportedLanguages);
router.post('/batch', translateBatch);
router.post('/', translateContent);

module.exports = router;