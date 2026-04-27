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

function update_visualizers(exclude_hover_id) {
	const visible_courses = enrolled_courses.filter((course) => course.sectionId !== exclude_hover_id).map(course_to_schedule);
	render_schedule(visible_courses);
	render_course_map(visible_courses);
}

function render_course({ sectionId, course }, btn_class, btn_label) {
	return `<div class="p-2 mb-3 rounded" style="background-color: #eaecec;">
		<div class="fw-semibold mb-1">${course.Subject} ${course.CatalogNbr} - ${uppercase_to_pascal_case(course.Title)}</div>
		<button class="btn btn-danger btn-sm ${btn_class}" data-section-id="${sectionId}">${btn_label}</button>
	</div>`;
}

function render_list(container, courses, btn_class, btn_label) {
	container.empty();
	if (courses.length === 0) {
		container.append('<p class="text-muted">No courses.</p>');
	} else {
		for (const entry of courses) {
			container.append(render_course(entry, btn_class, btn_label));
		}
	}
}

function bind_action_btn(selector, endpoint, list_ref_name) {
	$(selector)
		.on('mouseenter', function () {
			update_visualizers($(this).data('section-id'));
		})
		.on('mouseleave', () => update_visualizers())
		.on('click', async function () {
			const btn = $(this);
			const section_id = btn.data('section-id');
			const student_id = await get_student_id();
			if (!student_id) return;
			btn.prop('disabled', true);
			$.ajax({
				type: 'DELETE',
				url: `/api/students/${student_id}/courses/${encodeURIComponent(section_id)}/${endpoint}`,
				success: () => {
					if (list_ref_name === 'enrolled') enrolled_courses = enrolled_courses.filter((course) => course.sectionId !== section_id);
					else waitlisted_courses = waitlisted_courses.filter((course) => course.sectionId !== section_id);
					render_course_lists();
					update_visualizers();
				},
				error: (xhr) => {
					btn.prop('disabled', false);
					alert(xhr.responseJSON?.error || `Failed to ${endpoint} course.`);
				},
			});
		});
}

function render_course_lists() {
	render_list($('#enrolled-courses-list'), enrolled_courses, 'drop-btn', 'DROP');
	render_list($('#waitlisted-courses-list'), waitlisted_courses, 'remove-waitlist-btn', 'Remove Waitlist');
	bind_action_btn('.drop-btn', 'drop', 'enrolled');
	bind_action_btn('.remove-waitlist-btn', 'waitlist', 'waitlisted');
}

async function load_courses() {
	const student_id = await get_student_id();
	if (!student_id) {
		$('#enrolled-courses-list').html('<p class="text-muted">Unable to load student data.</p>');
		render_schedule([]);
		render_course_map([]);
		return;
	}

	try {
		const raw_enrolled_courses = await $.getJSON(`/api/students/${student_id}/courses`);
		const fileterd_enrolled_courses = Array.isArray(raw_enrolled_courses) ? raw_enrolled_courses.filter((course) => typeof course === 'string') : [];
		enrolled_courses = await load_section_details(fileterd_enrolled_courses);
	} catch (e) {
		enrolled_courses = [];
	}

	try {
		const raw_waitlisted_courses = await $.getJSON(`/api/students/${student_id}/waitlisted`);
		const filtered_waitlisted_courses = Array.isArray(raw_waitlisted_courses) ? raw_waitlisted_courses.filter((course) => typeof course === 'string') : [];
		waitlisted_courses = await load_section_details(filtered_waitlisted_courses);
	} catch (e) {
		waitlisted_courses = [];
	}

	render_course_lists();
	update_visualizers();
}

load_courses();
