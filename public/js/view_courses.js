let enrolled_courses = [];
let waitlisted_courses = [];

async function load_section_details(section_ids) {
	const details = await Promise.all(section_ids.map(get_section_details));
	return details.filter(Boolean);
}

function course_to_schedule({ course, section }) {
	return {
		label: `${course.Subject} ${course.CatalogNbr} - ${uppercase_to_pascal_case(course.Title)}`,
		days: section.days,
		startTime: section.startTime,
		endTime: section.endTime,
		room: section.room,
	};
}

function update_visualizers() {
	const courses = [];
	if ($('#show-enrolled').is(':checked')) courses.push(...enrolled_courses);
	if ($('#show-waitlisted').is(':checked')) courses.push(...waitlisted_courses);
	render_schedule(courses.map(course_to_schedule));
	render_course_map(courses.map(course_to_schedule));
}

function render_course({ sectionId, course, section }) {
	const days_times = section.days ? `${section.days} ${section.startTime}-${section.endTime}` : 'TBA';
	return `<div class="course-item mb-3 pb-3">
		<div class="d-flex align-items-center gap-2">
			<h5 class="mb-0 fw-bold">${course.Subject} ${course.CatalogNbr} - ${uppercase_to_pascal_case(course.Title)}</h5>
			<a href="/course/${sectionId}" class="text-secondary flex-shrink-0" title="View Details" style="margin-left: auto;">
				<i class="bi bi-info-circle"></i>
			</a>
		</div>
		<div class="text-muted small mt-1">
			Sec No. ${section.sectionNumber} | ${days_times} | ${section.room || 'TBA'} | ${section.instructor || 'TBA'} | ${course.Credits} Credits
		</div>
	</div>`;
}

function render_course_list() {
	const list = $('#course-list');
	list.empty();

	const show_enrolled = $('#show-enrolled').is(':checked');
	const show_waitlisted = $('#show-waitlisted').is(':checked');

	if (show_enrolled) {
		for (const course of enrolled_courses) {
			list.append(render_course(course));
		}
	}
	if (show_waitlisted) {
		for (const course of waitlisted_courses) {
			list.append(render_course(course));
		}
	}
	if (list.children().length === 0) {
		list.append('<p class="text-muted">No courses found.</p>');
	}
}

async function load_courses() {
	const student_id = await get_student_id();
	if (!student_id) {
		$('#course-list').html('<p class="text-muted">Unable to load student data.</p>');
		render_schedule([]);
		render_course_map([]);
		return;
	}

	try {
		const enrolled_response = await $.getJSON(`/api/students/${student_id}/courses`);
		const enrolled_ids = Array.isArray(enrolled_response) ? enrolled_response.filter((course) => typeof course === 'string') : [];
		enrolled_courses = await load_section_details(enrolled_ids);
	} catch (e) {
		enrolled_courses = [];
	}

	try {
		const waitlisted_response = await $.getJSON(`/api/students/${student_id}/waitlisted`);
		const waitlisted_ids = Array.isArray(waitlisted_response) ? waitlisted_response.filter((x) => typeof x === 'string') : [];
		waitlisted_courses = await load_section_details(waitlisted_ids);
	} catch (e) {
		waitlisted_courses = [];
	}

	render_course_list();
	update_visualizers();
}

$('#show-enrolled, #show-waitlisted').on('change', () => {
	render_course_list();
	update_visualizers();
});

load_courses();
