const { readDB, writeDB } = require('../utils/db');
const path = require('path');

const STUDENTS_DB = path.join(__dirname, '../db/students.json');

function getAllStudents() {
	return readDB(STUDENTS_DB);
}

function getStudentById(id) {
	const students = readDB(STUDENTS_DB);
	return students.find(s => s.id === id);
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
function getUnreadNotificxationCount(id) {
	const student = getStudentByID(id);

	if (!student) {
		throw new error('Student not found');
	}

	const notifications = student.notifications || [];

	return notifications.filter(n=> !n.read).length
}
module.exports = {
	getAllStudents,
	getStudentById,
	saveStudents,
	getNotifications,
	getUnreadNotificationCount
};
