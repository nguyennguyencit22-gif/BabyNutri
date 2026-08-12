const express = require('express');
const router = express.Router({ mergeParams: true });
const growthController = require('../controllers/growthController');
const auth = require('../middleware/auth');

// Get all growth records for a child
router.get('/:childId/growth', auth, growthController.getGrowthRecords);

// Add a new growth record for a child
router.post('/:childId/growth', auth, growthController.addGrowthRecord);

// Update a growth record
router.put('/:childId/growth/:recordId', auth, growthController.updateGrowthRecord);

// Delete a growth record
router.delete('/:childId/growth/:recordId', auth, growthController.deleteGrowthRecord);

module.exports = router;
