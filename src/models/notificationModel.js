const studentModel = require('./studentModel');

function createNotification({ sid, message }) {
    const students = studentModel.getAllStudents();

    const student = students.find(s => s.sid === sid);
    if (!student) throw new Error('Student not found');

    if (!student.notifications) {
        student.notifications = [];
    }

    const newNotification = {
        id: student.notifications.length + 1,
        message,
        read: false,
        date: new Date().toISOString()
    };

    student.notifications.push(newNotification);

    studentModel.saveStudents(students);

    return newNotification;
}

module.exports = { createNotification };