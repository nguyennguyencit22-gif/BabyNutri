const express = require('express');
const router = express.Router();
const childController = require('../controllers/childController');

router.get('/', childController.getChildren);
router.get('/:id', childController.getChildById);
router.post('/', childController.createChild);
router.put('/:id', childController.updateChild);
router.delete('/:id', childController.deleteChild);

module.exports = router;
