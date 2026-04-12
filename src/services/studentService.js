const studentModel = require('../models/studentModel');
const courseModel = require('../models/courseModel');
const { hasConflict } = require('../utils/scheduler');

function notify(student, message) {
	student.notifications.push({
		message,
		date: new Date().toISOString(),
	});
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

	const student = students.find(s => s.id === studentId);
	const course = courses.find(c => c.id === courseId);

	if (!student || !course) throw new Error('Not found');

	if (hasConflict(student.courses, course.schedule)) {
		throw new Error('Schedule conflict');
	}

	if (course.availableSeats <= 0) {
		throw new Error('Course full');
	}

	student.courses.push({
		courseId: course.id,
		schedule: course.schedule
	});

	course.availableSeats--;

	notify(student, `Enrolled in ${course.title}`);

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

// drop
function drop(studentId, courseId) {
	const students = studentModel.getAllStudents();
	const courses = courseModel.getAllCourses();

	const student = students.find(s => s.id === studentId);
	const course = courses.find(c => c.id === courseId);

	if (!student || !course) throw new Error('Not found');

	student.courses = student.courses.filter(c => c.courseId !== courseId);

	course.availableSeats++;

	notify(student, `Dropped ${course.title}`);

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

// waitlist
function addToWaitlist(studentId, courseId) {
	const courses = courseModel.getAllCourses();
	const students = studentModel.getAllStudents();

	const student = students.find(s => s.id === studentId);
	const course = courses.find(c => c.id === courseId);

	if (!student || !course) throw new Error('Not found');

	if (!student.waitlistedCourses.includes(courseId)) {
	student.waitlistedCourses.push(courseId);
	}

	if (!course.waitlist.includes(studentId)) {
		course.waitlist.push(studentId);
	}
	
	notify(student, `Added to waitlist for ${course.title}`);

	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	return true;
}

// remove waitlist
function removeFromWaitlist(studentId, courseId) {
	const courses = courseModel.getAllCourses();

	const course = courses.find(c => c.id === courseId);
	if (!course) throw new Error('Not found');

	course.waitlist = course.waitlist.filter(id => id !== studentId);

	courseModel.saveCourses(courses);

	return true;
}

module.exports = {
	getSchedule,
	enroll,
	drop,
	addToWaitlist,
	removeFromWaitlist
};