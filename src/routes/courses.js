const express = require('express');
const router = express.Router();
const { readDB } = require('../utils/db');
const path = require('path');

const CATALOG = path.join(__dirname, '../db/catalog.json');

function courseId(course) {
	return `${course.Subject}-${course.CatalogNbr}`;
}

function ci(haystack, needle) {
	return String(haystack ?? '')
		.toLowerCase()
		.includes(needle.toLowerCase());
}

function courseSearchBlob(course) {
	const instructors = (course.classTimes ?? []).map((ct) => ct.instructor).join(' ');
	const prereqText = course.parsedPrerequisites ? [...(course.parsedPrerequisites.prerequisites ?? []), ...(course.parsedPrerequisites.corequisites ?? [])].join(' ') : '';
	return [course.Subject, course.CatalogNbr, course.Title, course.LongTitle, course.Description, course.Level, course.Materials, instructors, prereqText].join(' ').toLowerCase();
}

// GET /api/courses with parameters
router.get('/', (req, res) => {
	const { q, subject, catalogNbr, instructor, level, credits, status, limit = 10, offset = 0 } = req.query;

	const limitNum = Math.max(1, Math.min(Number(limit) || 10, 100));
	const offsetNum = Math.max(0, Number(offset) || 0);

	let courses = readDB(CATALOG);

	if (q && q.trim()) {
		const needle = q.trim().toLowerCase();
		courses = courses.filter((c) => courseSearchBlob(c).includes(needle));
	}

	// subject
	if (subject && subject.trim()) {
		const needle = subject.trim().toLowerCase();
		courses = courses.filter((c) => ci(c.Subject, needle));
	}

	// catalogNbr (exact match)
	if (catalogNbr && catalogNbr.trim()) {
		courses = courses.filter((c) => c.CatalogNbr === catalogNbr.trim());
	}

	// level
	if (level && level.trim()) {
		const needle = level.trim().toLowerCase();
		courses = courses.filter((c) => ci(c.Level, needle));
	}

	// credits
	if (credits !== undefined && credits !== '') {
		const creditNum = Number(credits);
		if (!isNaN(creditNum)) {
			courses = courses.filter((c) => c.Credits === creditNum);
		}
	}

	// instructor (might be better to just not honestly)
	if (instructor && instructor.trim()) {
		const needle = instructor.trim().toLowerCase();
		courses = courses.filter((c) => (c.classTimes ?? []).some((ct) => ci(ct.instructor, needle)));
	}

	// status
	if (status && status.trim()) {
		const needle = status.trim().toLowerCase();
		courses = courses.filter((c) => ci(c.overallStatus, needle));
	}

	// pagination
	const total = courses.length;
	const paginated = courses.slice(offsetNum, offsetNum + limitNum);

	res.json({
		total,
		limit: limitNum,
		offset: offsetNum,
		courses: paginated.map((c) => ({ id: courseId(c), ...c })),
	});
});

// GET /api/courses/filters?q=...&subject=...
router.get('/filters', (req, res) => {
	const { q, subject } = req.query;
	let courses = readDB(CATALOG);

	if (subject?.trim()) courses = courses.filter((course) => course.Subject === subject.trim());
	if (q?.trim()) courses = courses.filter((course) => courseSearchBlob(course).includes(q.trim().toLowerCase()));

	const filters = {};
	for (const course of courses) {
		if (!filters[course.Subject]) filters[course.Subject] = { long_title: course.Subject, course_numbers: [] };
		if (!filters[course.Subject].course_numbers.includes(course.CatalogNbr)) filters[course.Subject].course_numbers.push(course.CatalogNbr);
	}
	res.json(filters);
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
	const courses = readDB(CATALOG);

	const rawId = req.params.id.trim();
	const normalised = rawId.replace(/[_ ]+/, '-').toUpperCase(); // supports Spaces and hyphens

	const course = courses.find((c) => courseId(c).toUpperCase() === normalised);

	if (!course) return res.status(404).json({ error: 'Course not found', id: rawId });

	res.json({ id: courseId(course), ...course });
});

module.exports = router;
