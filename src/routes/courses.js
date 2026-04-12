const express = require('express');
const router = express.Router();

const courseService = require('../services/courseService');

// GET /api/courses
router.get('/', (req, res) => {
	try {
		const result = courseService.searchCourses(req.query);
		res.json(result);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// GET /api/courses/filters
router.get('/filters', (req, res) => {
	try {
		const filters = courseService.getFilters(req.query);
		res.json(filters);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
	try {
		const course = courseService.getCourseById(req.params.id);
		res.json(course);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

module.exports = router;