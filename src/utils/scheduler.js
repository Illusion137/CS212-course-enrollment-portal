function hasConflict(studentCourses, newCourse) {
	for (let c of studentCourses) {
		if (c.day === newCourse.day) {
			if ((newCourse.start >= c.start && newCourse.start < c.end) || (newCourse.end > c.start && newCourse.end <= c.end)) {
				return true;
			}
		}
	}
	return false;
}

module.exports = { hasConflict };
