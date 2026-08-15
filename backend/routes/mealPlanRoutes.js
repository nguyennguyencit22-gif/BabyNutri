const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');
const auth = require('../middleware/auth');

router.get('/', mealPlanController.getMealPlans);
router.post('/', mealPlanController.createMealPlan);
router.get('/:id', mealPlanController.getMealPlanById);
router.delete('/items/:itemId', mealPlanController.deleteMealPlanItem);

module.exports = router;

