//db.js

const fs = require("fs");

function readDB(path) {
    return JSON.parse(fs.readFileSync(path));  
}

function writeDB(path, data) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };

//scheduler.js

function hasConflict(studentCourses, newCourse) {
    for (let c of studentCourses) {
        if (c.day === newCourse.day) {
            if(
                (newCourse.start >= c.start && newCourse.start < c.end) ||
                (newCourse.end > c.start && newCourse.end <= c.end) ||
            ) {
                return true;
            }
        }
    }    return false;
}

module.exports = { hasConflict };