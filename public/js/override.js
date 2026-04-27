let filters = {};
let current_subject = null;
let current_catalog_nbr = null;
let current_section_nbr = null;

const query_params = new URLSearchParams(window.location.search);
const course_from_url = query_params.get('course');
const prefill_params = { subject: null, catalog_nbr: null, section_nbr: null };
if (course_from_url) {
	const parts = course_from_url.split('|');
	prefill_params.subject = parts[0] ?? null;
	prefill_params.catalog_nbr = parts[1] ?? null;
	prefill_params.section_nbr = parts[2] ?? null;
}

const dropdown_btn = (data_attr, value, label) => `
	<li><button type="button" class="dropdown-item text-muted" data-${data_attr}="${value}">${label}</button></li>`;

function add_dropdown_items(list_id, items, data_attr, default_label) {
	const list = $(`#${list_id}`);
	list.empty();
	list.append(`
		${dropdown_btn(data_attr, '', default_label)}
		<li><hr class="dropdown-divider"></li>`);
	for (const { value, label } of items) {
		list.append(dropdown_btn(data_attr, value, label));
	}
}

function add_subject_dropdown_items(data) {
	const sorted_keys = Object.keys(data).sort();
	add_dropdown_items('override-subject-list', sorted_keys.map((key) => ({ value: key, label: data[key].long_title })), 'subject', 'Select Subject');
}

function add_course_dropdown_items(subject) {
	const numbers = filters[subject]?.course_numbers ?? [];
	add_dropdown_items('override-course-list', numbers.map((nbr) => ({ value: nbr, label: `${subject} ${nbr}` })), 'course', 'Select Course');
}

function add_section_dropdown_items(subject, catalog_nbr) {
	const section_list = $('#override-section-list');
	section_list.empty();
	section_list.append(`
		${dropdown_btn('section', '', 'Select Section')}
		<li><hr class="dropdown-divider"></li>`);
	const params = new URLSearchParams({ subject, catalogNbr: catalog_nbr });
	$.getJSON(`/api/courses?${params}`, (data) => {
		if (!data.courses.length) return;
		for (const ct of data.courses[0].classTimes) {
			section_list.append(dropdown_btn('section', ct.sectionNumber, `Section ${ct.sectionNumber} &mdash; ${ct.days} ${ct.startTime} (${ct.status})`));
		}
		if (prefill_params.section_nbr) {
			$(`#override-section-list [data-section="${prefill_params.section_nbr}"]`).trigger('click');
			prefill_params.section_nbr = null;
		}
	});
}

function add_events() {
	$('#override-subject-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const subject = $(this).data('subject');
			current_subject = subject || null;
			current_catalog_nbr = null;
			current_section_nbr = null;
			$('#override-subject-btn').text(subject ? $(this).text() : 'Select Subject');
			$('#override-course-btn').prop('disabled', !subject).text('Select Course');
			$('#override-section-btn').prop('disabled', true).text('Select Section');
			$('#override-course-list').empty();
			$('#override-section-list').empty();
			if (subject) add_course_dropdown_items(subject);
		});
	$('#override-course-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const catalog_nbr = $(this).data('course');
			current_catalog_nbr = catalog_nbr || null;
			current_section_nbr = null;
			$('#override-course-btn').text(catalog_nbr ? $(this).text() : 'Select Course');
			$('#override-section-btn').prop('disabled', !catalog_nbr).text('Select Section');
			$('#override-section-list').empty();
			if (catalog_nbr) add_section_dropdown_items(current_subject, catalog_nbr);
		});
	$('#override-section-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const section_nbr = $(this).data('section');
			current_section_nbr = section_nbr || null;
			$('#override-section-btn').text(section_nbr ? `Section ${section_nbr}` : 'Select Section');
		});
}

function on_filters_data(data) {
	filters = data;
	add_subject_dropdown_items(data);
	add_events();
	if (prefill_params.subject && filters[prefill_params.subject]) {
		$(`#override-subject-list [data-subject="${prefill_params.subject}"]`).trigger('click');
		if (prefill_params.catalog_nbr) {
			$(`#override-course-list [data-course="${prefill_params.catalog_nbr}"]`).trigger('click');
			prefill_params.catalog_nbr = null;
		}
		prefill_params.subject = null;
	}
}

function show_override_alert(type, message) {
	$('#override-alert').html(`<div class="alert alert-${type} py-2 mb-2">${message}</div>`);
}

async function submit_override(event) {
	event.preventDefault();
	const name = $('#override-form-name').val().trim();
	const email = $('#override-form-email').val().trim();
	const reason = $('#override-form-reason').val().trim();
	const course_id = current_subject && current_catalog_nbr && current_section_nbr ? `${current_subject}|${current_catalog_nbr}|${current_section_nbr}` : null;
	if (!name || !email || !course_id || !reason) {
		show_override_alert('danger', 'Please fill in all required fields.');
		return;
	}
	const student_id = await get_student_id();
	if (student_id === null) {
		show_override_alert('danger', 'Could not determine student ID.');
		return;
	}
	$('button[type="submit"]').prop('disabled', true);
	$.ajax({
		type: 'POST',
		url: '/api/overrides',
		contentType: 'application/json',
		data: JSON.stringify({ name, email, sid: student_id, course_id, reason }),
		success: () => {
			show_override_alert('success', 'Override request submitted successfully. Redirecting back to catalog...');
			$('#override-form')[0].reset();
			current_subject = null;
			current_catalog_nbr = null;
			current_section_nbr = null;
			$('#override-subject-btn').text('Select Subject');
			$('#override-course-btn').prop('disabled', true).text('Select Course');
			$('#override-section-btn').prop('disabled', true).text('Select Section');
			const REDIRECT_DELAY_MS = 4000;
			setTimeout(() => (window.location.href = '/'), REDIRECT_DELAY_MS);
		},
		error: (xhr) => {
			$('button[type="submit"]').prop('disabled', false);
			show_override_alert('danger', xhr.responseJSON?.error ?? 'Something went wrong.');
		},
	});
}

$.getJSON('/api/courses/filters', on_filters_data);
$('#override-form').on('submit', submit_override);
