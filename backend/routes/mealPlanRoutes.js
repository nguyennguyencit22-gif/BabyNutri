const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const auth = require('../middleware/auth');

router.get('/', auth, mealPlanController.getMealPlans);
router.post('/', auth, mealPlanController.createMealPlan);
router.get('/:id', auth, mealPlanController.getMealPlanById);
router.delete('/items/:itemId', auth, mealPlanController.deleteMealPlanItem);

module.exports = router;

