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
    getQuestionMessages,
    addQuestionMessage,
} = require('../controllers/questionController');

router.get('/', auth, getQuestions);
router.get('/public-experts', getPublicExperts);
router.get('/:id/messages', auth, getQuestionMessages);
router.post('/:id/messages', auth, addQuestionMessage);
router.post('/', auth, createQuestion);
router.post('/faq', auth, createFAQ);
router.post('/:id/answer', auth, answerQuestion);
router.delete('/:id', auth, deleteQuestion);

module.exports = router;
