const express = require('express');
const router = express.Router();
const path = require('path');
const { wait_for, generate_new_student_id } = require('../utils/utils');
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

let new_student_locked = false;
// POST /api/students/new
router.post('/new', async (req, res) => {
	try {
		await wait_for(() => new_student_locked === false);
		new_student_locked = true;
		const existing_users_set = new Set(studentService.getAllStudents().map((student) => student.id));
		const new_student_id = generate_new_student_id(existing_users_set);
		studentService.insertStudent(new_student_id);
		new_student_locked = false;
		res.json({ new_student_id });
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

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

// GET /api/students/:id/waitlisted
router.get('/:id/waitlisted', (req, res) => {
	try {
		const students = readDB(STUDENTS_DB);
		const student = students.find((s) => s.id === req.params.id);
		if (!student) return res.status(404).json({ error: 'Student not found' });
		res.json(student.waitlistedCourses || []);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/notifications
router.get('/:id/notifications', (req, res) => {
	try {
		const notifications = studentService.getNotifications(req.params.id);
		res.json(notifications);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// PATCH /api/students/:id/notifications/:notifId/read
router.patch('/:id/notifications/:notifId/read', (req, res) => {
	try {
		studentService.markNotificationRead(req.params.id, req.params.notifId);
		res.json({ success: true });
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/notifications/unread
router.get('/:id/notifications/unread', (req, res) => {
	try {
		const count = studentService.getUnreadNotificationCount(req.params.id);
		res.json({ unread: count });
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
