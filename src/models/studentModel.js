const { readDB, writeDB } = require('../utils/db');
const path = require('path');

const STUDENTS_DB = path.join(__dirname, '../db/students.json');

function getAllStudents() {
	return readDB(STUDENTS_DB);
}

function getStudentById(id) {
	const students = readDB(STUDENTS_DB);
	return students.find((s) => s.id === id);
}

function saveStudents(students) {
	writeDB(STUDENTS_DB, students);
}
// get all notifications for a student
function getNotifications(id) {
	const student = getStudentById(id);

	if (!student) {
		throw new Error('Student not found');
	}

	return student.notifications || [];
}

// Get unread notification count
function getUnreadNotificationCount(id) {
	const student = getStudentByID(id);

	if (!student) {
		throw new Error('Student not found');
	}

	const notifications = student.notifications || [];

	return notifications.filter((n) => !n.read).length;
}
// Mark a single notification as read
function markNotificationRead(id, notification_id) {
	const students = readDB(STUDENTS_DB);
	const student = students.find((s) => s.id === id);

	if (!student) {
		throw new Error('Student not found');
	}

	const notification = (student.notifications || []).find((n) => n.id == notification_id);

	if (!notification) {
		throw new Error('Notification not found');
	}

	notification.read = true;
	writeDB(STUDENTS_DB, students);
}

module.exports = {
	getAllStudents,
	getStudentById,
	saveStudents,
	getNotifications,
	getUnreadNotificationCount,
	markNotificationRead,
};
