function getCourseById(id) {
	const courses = courseModel.getAllCourses();

	const normalised = id.trim().replace(/[_ ]+/, '-').toUpperCase();

	const course = courses.find(
		c => courseId(c).toUpperCase() === normalised
	);

	if (!course) throw new Error('Course not found');

	return { id: courseId(course), ...course };
}

module.exports = {
	searchCourses,
	getFilters,
	getCourseById
};