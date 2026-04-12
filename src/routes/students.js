const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');
const { hasConflict } = require('../utils/scheduler');

const STUDENTS_DB = './db/students.json';
const COURSES_DB = './db/courses.json';

function notify(student, message) {
	student.notifications.push({
		message,
		date: new Date().toISOString(),
	});
}

// GET /api/students/:id/schedule
router.get('/:id/schedule', (req, res) => {
	const students = readDB(STUDENTS_DB);
	const student = students.find((s) => s.id === req.params.id);

	if (!student) return res.status(404).json({ error: 'Student not found' });

	res.json(student.courses);
});

// GET /api/students/:id/courses
router.get('/:id/courses', (req, res) => {
	const students = readDB(STUDENTS_DB);
	const student = students.find((s) => s.id === req.params.id);

	if (!student) return res.status(404).json({ error: 'Student not found' });

	res.json(student.courses);
});

// ENROLL
router.post('/:id/courses/:courseId/enroll', (req, res) => {
	const students = readDB(STUDENTS_DB);
	const courses = readDB(COURSES_DB);

	const student = students.find((s) => s.id === req.params.id);
	const course = courses.find((c) => c.id === req.params.courseId);

	if (!student || !course) return res.status(404).json({ error: 'Not found' });

	// Conflict check
	if (hasConflict(student.courses, course.schedule)) {
		return res.status(400).json({ error: 'Schedule conflict' });
	}

	if (course.availableSeats <= 0) {
		return res.status(400).json({ error: 'Course full' });
	}

	// Enroll
	student.courses.push(course.schedule);
	course.availableSeats--;

	notify(student, `Enrolled in ${course.title}`);

	writeDB(STUDENTS_DB, students);
	writeDB(COURSES_DB, courses);

	res.json({ success: true });
});

// DROP COURSE
router.delete('/:id/courses/:courseId/drop', (req, res) => {
	const students = readDB(STUDENTS_DB);
	const courses = readDB(COURSES_DB);

	const student = students.find((s) => s.id === req.params.id);
	const course = courses.find((c) => c.id === req.params.courseId);

	if (!student || !course) return res.status(404).json({ error: 'Not found' });

	// Remove course
	student.courses = student.courses.filter((c) => c.courseId !== course.id);

	course.availableSeats++;

	notify(student, `Dropped ${course.title}`);

	writeDB(STUDENTS_DB, students);
	writeDB(COURSES_DB, courses);

	res.json({ success: true });
});

// WAITLIST
router.post('/:id/courses/:courseId/waitlist', (req, res) => {
	const students = readDB(STUDENTS_DB);
	const courses = readDB(COURSES_DB);

	const student = students.find((s) => s.id === req.params.id);
	const course = courses.find((c) => c.id === req.params.courseId);

	course.waitlist.push(student.id);

	notify(student, `Added to waitlist for ${course.title}`);

	writeDB(STUDENTS_DB, students);
	writeDB(COURSES_DB, courses);

	res.json({ success: true });
});

// REMOVE WAITLIST
router.delete('/:id/courses/:courseId/waitlist', (req, res) => {
	const courses = readDB(COURSES_DB);

	const course = courses.find((c) => c.id === req.params.courseId);

	course.waitlist = course.waitlist.filter((id) => id !== req.params.id);

	writeDB(COURSES_DB, courses);

	res.json({ success: true });
});

module.exports = router;
