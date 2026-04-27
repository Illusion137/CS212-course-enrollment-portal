function show_action_alert(type, message) {
	$('#course-action-alert').html(`<div class="alert alert-${type} py-2 mb-2">${message}</div>`);
}

function to_schedule_item({ course, section }) {
	return {
		label: `${course.Subject} ${course.CatalogNbr} - ${uppercase_to_pascal_case(course.Title)}`,
		days: section.days,
		startTime: section.startTime,
		endTime: section.endTime,
		room: section.room,
	};
}

async function load_existing_schedule() {
	const student_id = await get_student_id();
	if (!student_id) return [];
	const schedule = [];
	for (const endpoint of ['courses', 'waitlisted']) {
		try {
			const raw_courses = await $.getJSON(`/api/students/${student_id}/${endpoint}`);
			const filtered_courses = Array.isArray(raw_courses) ? raw_courses.filter((course) => typeof course === 'string') : [];
			const details = (await Promise.all(filtered_courses.map(get_section_details))).filter(Boolean);
			schedule.push(...details.map(to_schedule_item));
		} catch (e) {}
	}
	return schedule;
}

async function submit_course_action(btn_selector, endpoint, success_msg) {
	const student_id = await get_student_id();
	if (student_id === null) {
		show_action_alert('danger', 'Could not determine student ID.');
		return;
	}
	$(btn_selector).prop('disabled', true);
	$.ajax({
		type: 'POST',
		url: `/api/students/${student_id}/courses/${SECTION_ID}/${endpoint}`,
		success: () => show_action_alert('success', success_msg),
		error: (xhr) => {
			$(btn_selector).prop('disabled', false);
			show_action_alert('danger', xhr.responseJSON?.error ?? 'Something went wrong.');
		},
	});
}

async function init_course_details() {
	const existing_schedule = await load_existing_schedule();
	const preview = existing_schedule.concat(CURRENT_COURSE_SCHEDULE.days ? [CURRENT_COURSE_SCHEDULE] : []);

	render_schedule(preview);
	render_course_map(preview);

	const has_conflict = find_conflicts(preview).some(({ course_a, course_b }) => course_a === CURRENT_COURSE_SCHEDULE || course_b === CURRENT_COURSE_SCHEDULE);
	if (has_conflict) {
		$('#enroll-btn').prop('disabled', true);
		$('#waitlist-btn').prop('disabled', true);
	}
}

$('#enroll-btn').on('click', () => submit_course_action('#enroll-btn', 'enroll', 'Successfully enrolled.'));
$('#waitlist-btn').on('click', () => submit_course_action('#waitlist-btn', 'waitlist', 'Added to waitlist.'));

init_course_details();
