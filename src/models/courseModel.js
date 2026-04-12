const { readDB, writeDB } = require('../utils/db');
const path = require('path');

const COURSES_DB = path.join(__dirname, '../db/courses.json');

function getAllCourses() {
	return readDB(COURSES_DB);
}

function getCourseById(id) {
	const courses = readDB(COURSES_DB);
	return courses.find(c => c.id === id);
}

function saveCourses(courses) {
	writeDB(COURSES_DB, courses);
}

module.exports = {
	getAllCourses,
	getCourseById,
	saveCourses
};