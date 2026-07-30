const express = require('express');
const router = express.Router();
const mealPlanController = require('../controllers/mealPlanController');

router.get('/', mealPlanController.getMealPlans);
router.get('/:id', mealPlanController.getMealPlanById);

module.exports = router;
