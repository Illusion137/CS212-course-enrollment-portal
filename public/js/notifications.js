const NOTIFICATION_TYPE_ICON_SOURCE_MAP = {
	INFO: '/img/info.svg',
	ERROR: '/img/error.svg',
	SUCCESS: '/img/success.svg',
};
function get_notification_icon(notification) {
	const src = NOTIFICATION_TYPE_ICON_SOURCE_MAP[notification.type] ?? NOTIFICATION_TYPE_ICON_SOURCE_MAP['INFO'];
	return `<img src="${src}" width="40" height="40" style="flex-shrink:0" />`;
}
function render_notification(notification) {
	const date_str = new Date(notification.date).toLocaleString();
	const read_class = notification.read ? '' : ' unread';
	return `<div class="notification-item${read_class} d-flex align-items-start gap-3 border-bottom py-3 w-100 pointer ${notification.read ? 'opacity-75' : ''}" data-id="${notification.id}">
		${get_notification_icon(notification)}
		<div class="w-100">
			<div class="w-100 d-flex align-items-center justify-content-between">
				<h5 class="mb-1">${notification.title}</h5>
				<small class="text-muted">${date_str}</small>
			</div>
			<p class="mb-1">${notification.message}</p>
		</div>
	</div>`;
}
function mark_notification_read(student_id, notification_id, notification_ref) {
	$.ajax({
		url: `/api/students/${student_id}/notifications/${notification_id}/read`,
		method: 'PATCH',
		success: () => {
			notification_ref.removeClass('unread');
		},
	});
}
function render_notification_list(notifications) {
	if (notifications.length === 0) {
		$('#notifications-status').text('No notifications right now... maybe check back later.');
		return;
	}
	$('#notifications-status').css('display', 'none');
	const rendered_html = notifications.map(render_notification).join('');
	$('#notification-list').append(rendered_html);
	$('.notification-item').on('click', async function () {
		const notification_ref = $(this);
		const notification_id = notification_ref.data('id');
		if (!notification_id || !notification_ref.hasClass('unread')) return;
		const student_id = await get_student_id();
		if (student_id === null) return;
		mark_notification_read(student_id, notification_id, notification_ref);
	});
}
async function load_notifications() {
	const student_id = await get_student_id();
	if (student_id === null) {
		$('#notifications-status').text('Error: no valid student_id found');
		return;
	}
	$.getJSON(`/api/students/${student_id}/notifications`, (data) => {
		render_notification_list(data);
	});
}
load_notifications();
