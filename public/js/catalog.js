let filters = {};
let current_subject = null;
let current_catalog_nbr = null;
let current_status = null;
let current_level = null;
let current_credits = null;
let current_instructor = null;
let current_offset = 0;

const LIMIT = 50;
const STATUSES = ['Open', 'Closed', 'Waitlist'];
const LEVELS = ['UNDERGRADUATE', 'GRADUATE'];
const CREDITS = [1, 2, 3, 4, 5, 6, 8, 9, 11, 12, 13, 14, 16, 18, 19, 20, 24, 30, 35, 45, 80, 99];

function add_simple_dropdown_items(list_id, items, data_attr, default_label) {
	const list_dropdown = $(`#${list_id}`);
	list_dropdown.empty();

	const list_menu_btn = (data_attr, label, item) => `
        <li>
            <button type="button" class="dropdown-item text-muted" data-${data_attr}="${item}">${label}</button>
        </li>`;
	list_dropdown.append(`
        ${list_menu_btn(data_attr, default_label, '')}
        <li>
            <hr class="dropdown-divider">
        </li>`);
	for (const item of items) {
		list_dropdown.append(list_menu_btn(data_attr, item, item));
	}
}

function add_events() {
	$('#subject-dropdown-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const key = $(this).data('subject');
			current_offset = 0;

			if (!key) {
				current_subject = null;
				current_catalog_nbr = null;
				$('#subject-btn').text('Select Subject');
				$('#course-nbr-btn').prop('disabled', true).text('Select Course');
				$('#course-nbr-dropdown-list').empty();
				fetch_courses(false);
				return;
			}

			$('#subject-btn').text($(this).text());
			current_subject = key;
			current_catalog_nbr = null;
			$('#course-nbr-btn').prop('disabled', false).text('Select Course');

			const course_nbr_dropdown_list = $('#course-nbr-dropdown-list');
			course_nbr_dropdown_list.empty();
			course_nbr_dropdown_list.append(`<li><button type="button" class="dropdown-item text-muted" data-course="">Select Course</button></li><li><hr class="dropdown-divider"></li>`);
			for (const nbr of filters[key]?.course_numbers ?? []) {
				course_nbr_dropdown_list.append(`<li><button type="button" class="dropdown-item" data-course="${nbr}">${key} ${nbr}</button></li>`);
			}

			fetch_courses(false);
		});

	$('#course-nbr-dropdown-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const num = $(this).data('course');
			current_offset = 0;

			if (!num) {
				current_catalog_nbr = null;
				$('#course-nbr-btn').text('Select Course');
			} else {
				current_catalog_nbr = num;
				$('#course-nbr-btn').text($(this).text());
			}

			fetch_courses(false);
		});

	$('#status-dropdown-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const val = $(this).data('status');
			current_status = val || null;
			current_offset = 0;
			$('#status-btn').text(val || 'Status');
			fetch_courses(false);
		});

	$('#level-dropdown-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const val = $(this).data('level');
			current_level = val || null;
			current_offset = 0;
			$('#level-btn').text(val ? uppercase_to_pascal_case(val) : 'Level');
			fetch_courses(false);
		});

	$('#credits-dropdown-list')
		.off('click', '.dropdown-item')
		.on('click', '.dropdown-item', function () {
			const val = $(this).data('credits');
			current_credits = val !== '' ? Number(val) : null;
			current_offset = 0;
			$('#credits-btn').text(val !== '' ? `${val} Credits` : 'Credits');
			fetch_courses(false);
		});
}

function add_subject_dropdown_items(data) {
	const subject_dropdown_list = $('#subject-dropdown-list');
	subject_dropdown_list.empty();

	// add subject menu buttons
	const subject_menu_btn = (data_subject, text) => `
        <li>
            <button type="button" class="dropdown-item text-muted" data-subject="${data_subject}">${text}</button>
        </li>`;

	subject_dropdown_list.append(`
        ${subject_menu_btn('', 'Select Subject')}
        <li>
            <hr class="dropdown-divider">
        </li>
    `);
	const sorted_keys = Object.keys(data).sort();
	for (const key of sorted_keys) {
		subject_dropdown_list.append(subject_menu_btn(key, data[key].long_title));
	}
}
function add_course_nbr_dropdown_items(data, current_subject) {
	if (data[current_subject]) {
		const nbr_dropdown_list = $('#course-nbr-dropdown-list');
		nbr_dropdown_list.empty();

		const subject_menu_btn = (data_course, text) => `
            <li>
                <button type="button" class="dropdown-item text-muted" data-course="${data_course}">${text}</button>
            </li>`;
		nbr_dropdown_list.append(`
            ${subject_menu_btn('', 'Select Course')}
            <li>
                <hr class="dropdown-divider">
            </li>`);
		for (const nbr of data[current_subject].course_numbers) {
			nbr_dropdown_list.append(subject_menu_btn(nbr, `${current_subject} ${nbr}`));
		}
		if (current_catalog_nbr && !data[current_subject].course_numbers.includes(current_catalog_nbr)) {
			current_catalog_nbr = null;
			$('#course-nbr-btn').text('Select Course');
		}
	} else {
		current_subject = null;
		current_catalog_nbr = null;
		$('#subject-btn').text('Select Subject');
		$('#course-nbr-btn').prop('disabled', true).text('Select Course');
		$('#course-nbr-dropdown-list').empty();
	}
}

function on_filters_data(data) {
	filters = data;
	add_subject_dropdown_items(data);
	if (current_subject) add_course_nbr_dropdown_items(data, current_subject);
	add_events();
}
function load_filters(query) {
	const query_params = new URLSearchParams();
	if (query) query_params.set('q', query);
	$.getJSON(`/api/courses/filters?${query_params}`, on_filters_data);
}

function render_course(course) {
	const course_id = `course-${course.Subject}${course.CatalogNbr}`;
	const section_id = (section_nbr) => create_section_id(course.Subject, course.CatalogNbr, section_nbr);

	const sections_html = course.classTimes
		.map((class_time) => {
			const is_closed = class_time.status === 'Closed';
			return `<tr id="${section_id(class_time.sectionNumber)}">
						<th class="text-nowrap${is_closed ? ' text-muted text-decoration-line-through' : ''} course-section-label">
                            <a href="/course/${section_id(class_time.sectionNumber)}">Section ${class_time.sectionNumber}:</a>
                        </th>
						<td>${class_time.days || 'TBA'}<br><span class="text-nowrap">${class_time.startTime} - ${class_time.endTime}</span></td>
						<td class="d-none d-sm-table-cell">${class_time.room || 'TBA'}</td>
						<td>${class_time.instructor || 'TBA'}</td>
						<td class="d-none d-sm-table-cell">${class_time.capacity - class_time.enrolled}</td>
						<td>${class_time.status || 'TBA'}</td>
					</tr>`;
		})
		.join('');

	return `<div class="course-item mb-3">
				<div class="course-item-header d-flex align-items-baseline gap-1"
				     role="button" data-bs-toggle="collapse" data-bs-target="#${course_id}">
					<h5 class="mb-0 fw-bold">${course.Subject} ${course.CatalogNbr} - ${uppercase_to_pascal_case(course.Title)}</h5>
					<span class="collapse-icon">&#9662;</span>
				</div>
				<div class="collapse" id="${course_id}">
					<div class="course-section-scroll mt-2">
						<table class="table table-sm table-borderless mb-0 course-section-table">
							<thead>
								<tr class="text-muted small">
									<th></th>
									<th>Days &amp; Times</th>
									<th class="d-none d-sm-table-cell">Room</th>
									<th>Instructor</th>
									<th class="d-none text-nowrap d-sm-table-cell">Available Seats</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>${sections_html}</tbody>
						</table>
					</div>
				</div>
			</div>`;
}

function fetch_courses(append) {
	const search_query = $('#search-input').val().trim();
	if (!current_subject && !search_query && !current_status && !current_level && current_credits === null && !current_instructor) {
		$('#course-list').empty();
		$('#load-more-btn').hide();
		return;
	}

	const query_params = new URLSearchParams({ limit: LIMIT, offset: current_offset });
	if (current_subject) query_params.set('subject', current_subject);
	if (current_catalog_nbr) query_params.set('catalogNbr', current_catalog_nbr);
	if (current_status) query_params.set('status', current_status);
	if (current_level) query_params.set('level', current_level);
	if (current_credits !== null) query_params.set('credits', current_credits);
	if (current_instructor) query_params.set('instructor', current_instructor);
	if (search_query) query_params.set('q', search_query);

	$.getJSON(`/api/courses?${query_params}`, function (data) {
		const html = data.courses.map(render_course).join('');
		if (append) {
			$('#course-list').append(html || '');
		} else {
			$('#course-list').html(html || '<p class="text-muted">No courses found.</p>');
		}
		$('#load-more-btn').toggle(current_offset + LIMIT < data.total);
	});
}

load_filters();
add_simple_dropdown_items('status-dropdown-list', STATUSES, 'status', 'Status');
add_simple_dropdown_items('level-dropdown-list', LEVELS, 'level', 'Level');
add_simple_dropdown_items('credits-dropdown-list', CREDITS, 'credits', 'Credits');

// debouncing search input
let search_timer;
$('#search-input').on('input', function () {
	const q = $(this).val().trim();
	clearTimeout(search_timer);
	search_timer = setTimeout(() => {
		current_offset = 0;
		load_filters(q);
		fetch_courses(false);
	}, 300);
});

// debouncing instructor input
let instructor_timer;
$('#instructor-input').on('input', function () {
	const val = $(this).val().trim();
	clearTimeout(instructor_timer);
	instructor_timer = setTimeout(() => {
		current_instructor = val || null;
		current_offset = 0;
		fetch_courses(false);
	}, 300);
});
$('#load-more-btn').on('click', () => {
	current_offset += LIMIT;
	fetch_courses(true);
});
