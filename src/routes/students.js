const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../utils/db');
const { hasConflict } = require('../utils/scheduler');

const STUDENTS_DB = path.join(__dirname, '../db/students.json');
const COURSES_DB = path.join(__dirname, '../db/courses.json');

const studentService = require('../services/studentService');

function notify(student, message) {
	student.notifications.push({
		message,
		date: new Date().toISOString(),
	});
}

// GET /api/students/:id/schedule
router.get('/:id/schedule', (req, res) => {
	try {
		const schedule = studentService.getSchedule(req.params.id);
		res.json(schedule);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/courses
router.get('/:id/courses', (req, res) => {
	try {
		const schedule = studentService.getSchedule(req.params.id);
		res.json(schedule);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// enroll
router.post('/:id/courses/:courseId/enroll', (req, res) => {
	try {
		studentService.enroll(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// drop course
router.delete('/:id/courses/:courseId/drop', (req, res) => {
	try {
		studentService.drop(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// add waitlist
router.post('/:id/courses/:courseId/waitlist', (req, res) => {
	try {
		studentService.addToWaitlist(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// remove waitlist
router.delete('/:id/courses/:courseId/waitlist', (req, res) => {
	try {
		studentService.removeFromWaitlist(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

module.exports = router;
