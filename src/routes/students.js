const express = require('express');
const router = express.Router();
const path = require('path');
const { wait_for, generate_new_student_id, parse_section_id } = require('../utils/utils');
const { readDB, writeDB } = require('../utils/db');
const { hasConflict } = require('../utils/scheduler');
const STUDENTS_DB = path.join(__dirname, '../db/students.json');
const COURSES_DB = path.join(__dirname, '../db/courses.json');

const studentService = require('../services/studentService');

function notify(student, message) {
	student.notifications.push({
		message,
		date: new Date().toISOString(),
	});
}

let new_student_locked = false;
// POST /api/students/new
router.post('/new', async (req, res) => {
	try {
		await wait_for(() => new_student_locked === false);
		new_student_locked = true;
		const existing_users_set = new Set(studentService.getAllStudents().map((student) => student.id));
		const new_student_id = generate_new_student_id(existing_users_set);
		studentService.insertStudent(new_student_id);
		new_student_locked = false;
		res.json({ new_student_id });
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/schedule
router.get('/:id/schedule', (req, res) => {
	try {
		const schedule = studentService.getSchedule(req.params.id);
		res.json(schedule);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/courses
router.get('/:id/courses', (req, res) => {
	try {
		const schedule = studentService.getSchedule(req.params.id);
		res.json(schedule);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/waitlisted
router.get('/:id/waitlisted', (req, res) => {
	try {
		const students = readDB(STUDENTS_DB);
		const student = students.find((s) => s.id === req.params.id);
		if (!student) return res.status(404).json({ error: 'Student not found' });
		res.json(student.waitlistedCourses || []);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/notifications
router.get('/:id/notifications', (req, res) => {
	try {
		const notifications = studentService.getNotifications(req.params.id);
		res.json(notifications);
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// PATCH /api/students/:id/notifications/:notifId/read
router.patch('/:id/notifications/:notifId/read', (req, res) => {
	try {
		studentService.markNotificationRead(req.params.id, req.params.notifId);
		res.json({ success: true });
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// GET /api/students/:id/notifications/unread
router.get('/:id/notifications/unread', (req, res) => {
	try {
		const count = studentService.getUnreadNotificationCount(req.params.id);
		res.json({ unread: count });
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

// enroll
router.post('/:id/courses/:courseId/enroll', (req, res) => {
	try {
		studentService.enroll(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// drop course
router.delete('/:id/courses/:courseId/drop', (req, res) => {
	try {
		studentService.drop(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// add waitlist
router.post('/:id/courses/:courseId/waitlist', (req, res) => {
	try {
		studentService.addToWaitlist(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// POST /api/students/:id/waitlist/:courseId
router.post('/:id/waitlist/:courseId', (req, res) => {
	try {
		studentService.addToWaitlist(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// DELETE /api/students/:id/waitlist/:courseId
router.delete('/:id/waitlist/:courseId', (req, res) => {
	try {
		studentService.removeFromWaitlist(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// remove waitlist
router.delete('/:id/courses/:courseId/waitlist', (req, res) => {
	try {
		studentService.removeFromWaitlist(req.params.id, req.params.courseId);
		res.json({ success: true });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Serverside coords as a public API
// From Illusion137/Rui
const BUILDING_COORDS = {
	'Southwest Forest Sci': { lat: 35.17620348343843, lng: -111.65743281804009 },
	Engineering: { lat: 35.1772613565739, lng: -111.65705478852685 },
	'SBS West': { lat: 35.17797220958298, lng: -111.65845282199744 },
	'SBS-Raul H. Castro': { lat: 35.17814319259122, lng: -111.65762748058481 },
	'W.A.FrankeCollBusiness': { lat: 35.17871520586243, lng: -111.65696188264731 },
	'Learning Resource Ctr': { lat: 35.178951471038616, lng: -111.65616696856311 },
	'Babbitt Administrative': { lat: 35.18012186565375, lng: -111.65778950456982 },
	'Bilby Research Center': { lat: 35.1823704379745, lng: -111.6552217562143 },
	'Anthropology Laboratory': { lat: 35.18367146989086, lng: -111.65420734372574 },
	'International Pavilion': { lat: 35.18338069517848, lng: -111.65640110260169 },
	'Applied Research': { lat: 35.185290018101455, lng: -111.65810691302507 },
	'Information Systems': { lat: 35.18631876125533, lng: -111.65769922775597 },
	SICCS: { lat: 35.186197978321445, lng: -111.65844325337207 },
	'Gateway Student Success': { lat: 35.18660757013335, lng: -111.65459268606479 },
	'Student Academic Serv': { lat: 35.187571829580605, lng: -111.65399435890684 },
	'Ardrey Auditorium': { lat: 35.188042272870895, lng: -111.65764992542421 },
	'Kitt School of Music': { lat: 35.18870158515072, lng: -111.65790875231755 },
	'Clifford White Theater': { lat: 35.18860543577643, lng: -111.65757597488326 },
	'HRM Hughes East': { lat: 35.18928332688236, lng: -111.65297932552701 },
	'NAU Health & Learning': { lat: 35.18917304132804, lng: -111.65204174781222 },
	'Babbitt Academic Annex': { lat: 35.190586604010214, lng: -111.65446951547868 },
	'Academic Annex': { lat: 35.19077611967518, lng: -111.6541638323104 },
	'Adel Mathematics': { lat: 35.19062967579186, lng: -111.65619469297972 },
	'Cline Library': { lat: 35.18984017271349, lng: -111.65762211257925 },
	'College of Education': { lat: 35.19122659901538, lng: -111.65794079474891 },
	'School of Communication': { lat: 35.19166361245103, lng: -111.65582546099543 },
	'Geology Annex': { lat: 35.19209623304888, lng: -111.65711581522086 },
	WETTAW: { lat: 35.19296547467282, lng: -111.65327453952752 },
	'Science Annex': { lat: 35.192213971663776, lng: -111.65291619689295 },
	'Science Laboratory': { lat: 35.19233680600876, lng: -111.65419441868744 },
	'Biological Sciences Annex': { lat: 35.191138145519325, lng: -111.65357801851151 },
	'Science and Health': { lat: 35.19140894148339, lng: -111.65492799245023 },
	'Department of English': { lat: 35.19158525882302, lng: -111.65395723776717 },
	'Liberal Arts': { lat: 35.19146568693629, lng: -111.65399317444027 },
	'Physical Sciences': { lat: 35.19221877711133, lng: -111.65368257890833 },
	'Chemistry & Biochemistry': { lat: 35.191453307966235, lng: -111.65460277564203 },
};

function get_building_coords(room_str) {
	if (!room_str || room_str === 'TBA' || room_str === 'Online') return null;
	for (const key of Object.keys(BUILDING_COORDS)) {
		if (room_str.startsWith(key) || room_str.includes(key)) return { key, ...BUILDING_COORDS[key] };
	}
	return null;
}

// GET /api/students/:id/map
router.get('/:id/map', (req, res) => {
	try {
		const additionalCourseIds = req.body?.additional_course_ids ?? [];

		const student = studentService.getSchedule(req.params.id); // returns array of section_id strings
		const enrolledIds = student; // e.g. ["CS|212|001", "MATH|136|002"]

		const courses = readDB(COURSES_DB);

		const allIds = [...new Set([...enrolledIds, ...additionalCourseIds])];

		const mapCourses = allIds
			.map((section_id) => {
				const { course_subject, course_nbr, section_nbr } = parse_section_id(section_id);
				const course = courses.find((c) => c.Subject === course_subject && c.CatalogNbr === course_nbr);
				if (!course) return null;
				const section = course.classTimes?.find((t) => t.sectionNumber === section_nbr) ?? null;
				return {
					section_id,
					title: course.Title,
					subject: course.Subject,
					course_nbr: course.CatalogNbr,
					section,
					coords: get_building_coords(section.room),
					is_additional: !enrolledIds.includes(section_id),
				};
			})
			.filter(Boolean);

		res.json({ courses: mapCourses });
	} catch (err) {
		res.status(404).json({ error: err.message });
	}
});

module.exports = router;
