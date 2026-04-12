const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');

const OVERRIDES_DB = './db/overrides.json';

// Submit override
router.post('/', (req, res) => {
	const overrides = readDB(OVERRIDES_DB);

	const newRequest = {
		id: overrides.length,
		...req.body,
		date: new Date().toISOString(),
	};

	overrides.push(newRequest);

	writeDB(OVERRIDES_DB, overrides);

	res.json({ success: true });
});

// Get all
router.get('/', (req, res) => {
	const overrides = readDB(OVERRIDES_DB);
	res.json(overrides);
});

module.exports = router;
