const studentModel = require('../models/studentModel');
const courseModel = require('../models/courseModel');

const { parse_section_id } = require('../utils/utils');

function find_course(courses, section_id) {
	const { course_subject, course_nbr } = parse_section_id(section_id);
	return courses.find((course) => course.Subject === course_subject && course.CatalogNbr === course_nbr);
}

function notify(student, title, message, type) {
	student.notifications.push({
		id: student.notifications.length + 1,
		title,
		type,
		message,
		date: new Date().toISOString(),
	});
}

function insertStudent(id) {
	const students = studentModel.getAllStudents();
	students.push({ id });
	studentModel.saveStudents(students);
}

function getAllStudents() {
	return studentModel.getAllStudents();
}

// GET student schedule
function getSchedule(studentId) {
	const student = studentModel.getStudentById(studentId);
	if (!student) throw new Error('Student not found');
	return student.courses;
}

// enroll
function enroll(studentId, courseId) {
	const students = studentModel.getAllStudents();
	const courses = courseModel.getAllCourses();

	const student = students.find((s) => s.id === studentId);
	const course = find_course(courses, courseId);

	if (!student || !course) throw new Error('Not found');

	if (student.courses.includes(courseId)) {
		throw new Error('Already enrolled');
	}

	student.courses.push(courseId);

	course.availableSeats--;

	notify(student, 'Successful Enrollement', `You are now enrolled in the course: ${course.LongTitle}`, 'SUCCESS');

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

// drop
function drop(studentId, courseId) {
	const students = studentModel.getAllStudents();
	const courses = courseModel.getAllCourses();

	const student = students.find((s) => s.id === studentId);
	const course = find_course(courses, courseId);

	if (!student || !course) throw new Error('Not found');

	student.courses = student.courses.filter((section_id) => section_id !== courseId);

	course.availableSeats++;

	notify(student, 'Course Successfully Dropped', `You are no longer in the course: ${course.LongTitle}`, 'INFO');

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

// waitlist
function addToWaitlist(studentId, courseId) {
	const courses = courseModel.getAllCourses();
	const students = studentModel.getAllStudents();

	const student = students.find((s) => s.id === studentId);
	const course = find_course(courses, courseId);

	if (!student || !course) throw new Error('Not found');

	if (!student.waitlistedCourses.includes(courseId)) {
		student.waitlistedCourses.push(courseId);
	}

	if (!course.waitlist) course.waitlist = [];
	if (!course.waitlist.includes(studentId)) {
		course.waitlist.push(studentId);
	}

	notify(student, 'Course added to Waitlist', `You are now waitlisted for the course: ${course.LongTitle}`, 'INFO');

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

// remove waitlist
function removeFromWaitlist(studentId, courseId) {
	const students = studentModel.getAllStudents();
	const courses = courseModel.getAllCourses();

	const student = students.find((s) => s.id === studentId);
	const course = find_course(courses, courseId);
	if (!student || !course) throw new Error('Not found');

	student.waitlistedCourses = (student.waitlistedCourses || []).filter((section_id) => section_id !== courseId);
	course.waitlist = (course.waitlist || []).filter((id) => id !== studentId);

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

function getNotifications(id) {
	return studentModel.getNotifications(id);
}

function markNotificationRead(id, notification_id) {
	return studentModel.markNotificationRead(id, notification_id);
}

function getUnreadNotificationCount(studentId) {
	return studentModel.getUnreadNotificationCount(studentId);
}

module.exports = {
	getAllStudents,
	getSchedule,
	enroll,
	drop,
	addToWaitlist,
	removeFromWaitlist,
	getNotifications,
	markNotificationRead,
	insertStudent,
	getUnreadNotificationCount,
};
