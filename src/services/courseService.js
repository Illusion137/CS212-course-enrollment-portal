const courseModel = require('../models/courseModel');

// helpers
function courseId(course) {
	return `${course.Subject}-${course.CatalogNbr}`;
}

function ci(haystack, needle) {
	return String(haystack ?? '')
		.toLowerCase()
		.includes(String(needle).toLowerCase());
}

function courseSearchBlob(course) {
	const instructors = (course.classTimes ?? []).map((ct) => ct.instructor).join(' ');

	const prereqText = course.parsedPrerequisites ? [...(course.parsedPrerequisites.prerequisites ?? []), ...(course.parsedPrerequisites.corequisites ?? [])].join(' ') : '';

	return [course.Subject, course.CatalogNbr, course.Title, course.LongTitle, course.Description, course.Level, course.Materials, instructors, prereqText].join(' ').toLowerCase();
}

// search courses
function searchCourses(query = {}) {
	let courses = courseModel.getAllCourses();

	const { q, subject, catalogNbr, instructor, level, credits, status, limit = 10, offset = 0 } = query;

	const limitNum = Math.max(1, Math.min(Number(limit) || 10, 100));
	const offsetNum = Math.max(0, Number(offset) || 0);

	if (q?.trim()) {
		const needle = q.trim().toLowerCase();
		courses = courses.filter((c) => courseSearchBlob(c).includes(needle));
	}

	if (subject?.trim()) {
		courses = courses.filter((c) => c.Subject === subject.trim());
	}
	// course number
	if (catalogNbr?.trim()) {
		courses = courses.filter((c) => c.CatalogNbr === catalogNbr.trim());
	}

	// level
	if (level?.trim()) {
		courses = courses.filter((c) => ci(c.Level, level));
	}

	// credits
	if (credits !== undefined && credits !== '') {
		const creditNum = Number(credits);
		if (!isNaN(creditNum)) {
			courses = courses.filter((c) => c.Credits === creditNum);
		}
	}

	// instructor
	if (instructor?.trim()) {
		courses = courses.filter((c) => (c.classTimes ?? []).some((ct) => ci(ct.instructor, instructor)));
	}

	// status
	if (status?.trim()) {
		courses = courses.filter((c) => ci(c.overallStatus, status));
	}

	const total = courses.length;
	const paginated = courses.slice(offsetNum, offsetNum + limitNum);

	return {
		total,
		limit: limitNum,
		offset: offsetNum,
		courses: paginated.map((c) => ({
			id: courseId(c),
			...c,
		})),
	};
}

// search by filters
function getFilters(query = {}) {
	let courses = courseModel.getAllCourses();

	const { q, subject } = query;

	if (subject?.trim()) {
		courses = courses.filter((c) => c.Subject === subject.trim());
	}

	if (q?.trim()) {
		const needle = q.trim().toLowerCase();
		courses = courses.filter((c) => courseSearchBlob(c).includes(needle));
	}

	const filters = {};

	for (const course of courses) {
		if (!filters[course.Subject]) {
			filters[course.Subject] = {
				long_title: course.Subject,
				course_numbers: [],
			};
		}

		if (!filters[course.Subject].course_numbers.includes(course.CatalogNbr)) {
			filters[course.Subject].course_numbers.push(course.CatalogNbr);
		}
	}

	return filters;
}

//search by id
function getCourseById(id) {
	const courses = courseModel.getAllCourses();

	const normalised = id.trim().replace(/[_ ]+/, '-').toUpperCase();

	const course = courses.find((c) => courseId(c).toUpperCase() === normalised);

	if (!course) throw new Error('Course not found');

	return {
		id: courseId(course),
		...course,
	};
}

module.exports = {
	searchCourses,
	getFilters,
	getCourseById,
};
