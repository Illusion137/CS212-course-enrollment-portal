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

module.exports = {
	getAllStudents,
	getStudentById,
	saveStudents
};