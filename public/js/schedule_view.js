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
			.text(course.startTime + ' - ' + course.endTime)
	);
	if (course.room) {
		time_block.append($('<div>').addClass('schedule-block-time').text(course.room));
	}

	day_column.append(time_block);
}

function render_course(i, course) {
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

function render_schedule(courses) {
	$('.schedule-day-body .schedule-block').remove();
	for (const [i, course] of Object.entries(courses)) {
		render_course(i, course);
	}
}
