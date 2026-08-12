const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    getQuestions,
    getPublicExperts,
    createQuestion,
    answerQuestion,
    createFAQ,
    deleteQuestion,
} = require('../controllers/questionController');

router.get('/', getQuestions);
router.get('/public-experts', getPublicExperts);
router.post('/', auth, createQuestion);
router.post('/faq', auth, createFAQ);
router.post('/:id/answer', auth, answerQuestion);
router.delete('/:id', auth, deleteQuestion);

module.exports = router;
