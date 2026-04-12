const express = require('express');
const router = express.Router();

//GET /api/courses?limit=&offset=
router.get('/', (req, res) => {
	const { limit = 10, offset = 0 } = req.query;
	const courses = readDB(COURSES_DB);

	const paginated = courses.slice(Number(offset), Number(offset) + Number(limit));
	res.json(paginated);
});

//GET /api/courses/:id
router.get('/:id', (req, res) => {
	const courses = readDB(COURSES_DB);
	const course = courses.find((c) => c.id === req.params.id);

	if (!course) return res.status(404).json({ message: 'Course not found' });

	res.json(course);
});

module.exports = router;
