const express = require('express');
const router = express.Router();

const overrideService = require('../services/overrideService');

// submit override
router.post('/', (req, res) => {
	try {
		const newOverride = overrideService.createOverride(req.body);
		res.json({ success: true, data: newOverride });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// get all overrides
router.get('/', (req, res) => {
	try {
		const overrides = overrideService.getAllOverrides();
		res.json(overrides);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;