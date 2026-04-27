const SCHEDULE_COLORS = [
	{ background_color: '#bbcbdc', text: '#14306c' },
	{ background_color: '#b5ddc8', text: '#113c21' },
	{ background_color: '#d9d1b5', text: '#613012' },
	{ background_color: '#e9caca', text: '#721717' },
	{ background_color: '#c7bdec', text: '#50157f' },
	{ background_color: '#e0ade0', text: '#0b2f2d' },
	{ background_color: '#c0dfdf', text: '#681e6d' },
];

const SIZE_PX = 60;
const EIGHT_AM_MIN = 8 * 60;
const GRID_START = EIGHT_AM_MIN;
const HOURS = 13;
const GRID_HEIGHT_PX = HOURS * SIZE_PX;

function render_day(day, course, color, top_percent, height_percent) {
	const day_column = $(`.schedule-day-body[data-day="${day}"]`);
	if (!day_column.length) return;

	const time_block = $('<div>')
		.addClass('schedule-block')
		.css({
			top: top_percent + '%',
			height: height_percent + '%',
			background: color.background_color,
			color: color.text,
		});

	time_block.append(
		$('<div>').addClass('schedule-block-label').text(course.label),
		$('<div>')
			.addClass('schedule-block-time')
			.text(course.startTime + ' - ' + course.endTime),
	);
	if (course.room) {
		time_block.append($('<div>').addClass('schedule-block-time').text(course.room));
	}

	day_column.append(time_block);
}

function render_schedule_block(i, course) {
	const color = SCHEDULE_COLORS[i % SCHEDULE_COLORS.length];
	const start = parse_time(course.startTime);
	const end = parse_time(course.endTime);
	const days = parse_days(course.days);
	const top_percent = ((start - GRID_START) / GRID_HEIGHT_PX) * 100;
	const height_percent = ((end - start) / GRID_HEIGHT_PX) * 100;

	for (const day of days) {
		render_day(day, course, color, top_percent, height_percent);
	}
}

function find_conflicts(courses) {
	const conflicts = [];
	for (let i = 0; i < courses.length; i++) {
		for (let j = i + 1; j < courses.length; j++) {
			const course_a = courses[i];
			const course_b = courses[j];
			const course_a_days = new Set(parse_days(course_a.days));
			const course_b_days = new Set(parse_days(course_b.days));
			const shared_days = course_a_days.intersection(course_b_days);
			if (shared_days.size === 0) continue;
			const course_a_start = parse_time(course_a.startTime);
			const course_a_end = parse_time(course_a.endTime);
			const course_b_start = parse_time(course_b.startTime);
			const course_b_end = parse_time(course_b.endTime);
			if (course_a_start < course_b_end && course_b_start < course_a_end) {
				conflicts.push({ course_a, course_b });
			}
		}
	}
	return conflicts;
}

function render_conflicts(courses) {
	const banner = $('#schedule-conflict-banner');
	const body = $('#schedule-conflict-body');
	const conflicts = find_conflicts(courses);
	if (conflicts.length === 0) {
		banner.hide();
		return;
	}
	body.empty();
	for (const { course_a, course_b } of conflicts) {
		const course_a_text = `${course_a.label} (${course_a.days} ${course_a.startTime}-${course_a.endTime})`;
		const course_b_text = `${course_b.label} (${course_b.days} ${course_b.startTime}-${course_b.endTime})`;
		const inner_html = `Conflict between Courses: <br/>&emsp;${course_a_text} and <br/>&emsp;${course_b_text}`;

		body.append($('<p>').addClass('schedule-conflict-item').html(inner_html));
	}
	banner.show();
}

function render_schedule(courses) {
	$('.schedule-day-body .schedule-block').remove();
	for (const [i, course] of Object.entries(courses)) {
		render_schedule_block(i, course);
	}
	render_conflicts(courses);
}
