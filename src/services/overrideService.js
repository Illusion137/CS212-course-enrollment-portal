const overrideModel = require('../models/overrideModel');

function createOverride(data) {
	const overrides = overrideModel.getAllOverrides();

	const newRequest = {
		id: overrides.length,
		...data,
		date: new Date().toISOString(),
	};

	overrides.push(newRequest);

	overrideModel.saveOverrides(overrides);

	return newRequest;
}

function getAllOverrides() {
	return overrideModel.getAllOverrides();
}

// ACCEPT OVERRIDE
function acceptOverride(id) {
	const overrides = overrideModel.getAllOverrides();
	const students = studentModel.getAllStudents();
	const courses = courseModel.getAllCourses();

	const request = overrides.find((o) => o.id === id);
	if (!request) throw new Error('Override not found');

	if (request.status === 'accepted') {
		throw new Error('Already accepted');
	}
	if (request.status === 'denied') {
		throw new Error('Already denied');
	}

	const student = students.find((s) => s.sid === request.sid);
	const course = courses.find((c) => c.id === request.course_id);

	if (!student || !course) {
		throw new Error('Student or course not found');
	}

	// initialize arrays
	if (!student.courses) student.courses = [];
	if (!course.students) course.students = [];

	// prevent duplicates
	if (!student.courses.includes(course.id)) {
		student.courses.push(course.id);
	}

	if (!course.students.includes(student.sid)) {
		course.students.push(student.sid);
	}

	// update status
	request.status = 'accepted';

	// save all DBs
	overrideModel.saveOverrides(overrides);
	studentModel.saveStudents(students);
	courseModel.saveCourses(courses);

	// notify
	notificationModel.createNotification({
		type: 'SUCCESS',
		title: 'Override Approved!',
		sid: student.sid,
		message: `Override has been aprroved for the course: ${course.id}`,
	});

	return request;
}

// DENY OVERRIDE
function denyOverride(id) {
	const overrides = overrideModel.getAllOverrides();

	const request = overrides.find((o) => o.id === id);
	if (!request) throw new Error('Override not found');

	if (request.status === 'accepted') {
		throw new Error('Already accepted');
	}
	if (request.status === 'denied') {
		throw new Error('Already denied');
	}

	request.status = 'denied';

	overrideModel.saveOverrides(overrides);

	// notify
	notificationModel.createNotification({
		type: 'ERROR',
		sid: request.sid,
		title: 'Override Denied...',
		message: `Override has been denied for the course: ${request.course_id}`,
	});

	return request;
}

module.exports = {
	createOverride,
	getAllOverrides,
	acceptOverride,
	denyOverride,
};
