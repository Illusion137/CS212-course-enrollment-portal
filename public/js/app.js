async function get_student_id() {
	const STUDENT_ID_KEY = 'STUID';
	const student_id = localStorage.getItem(STUDENT_ID_KEY);
	if (student_id) return student_id;
	// we don't have one; create one for the user.
	let { new_student_id, error } = await $.post('/api/students/new', {});
	if (error) return null;
	localStorage.setItem(STUDENT_ID_KEY, new_student_id);
	return new_student_id;
}

function only_i(word) {
	return /^i+$/.test(word.toLowerCase());
}

function uppercase_to_pascal_case(str) {
	return str
		.split(' ')
		.map((word) => (only_i(word) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1).toLowerCase()))
		.join(' ');
}

function create_section_id(course_subject, course_nbr, section_nbr) {
	return `${course_subject}|${course_nbr}|${section_nbr}`;
}

// Much taken from https://github.com/Illusion137/Louis (my repo)
function parse_time(str) {
	const [time, period] = str.trim().split(' ');
	let [hour, minute] = time.split(':').map(Number);
	if (period === 'PM' && hour !== 12) hour += 12;
	if (period === 'AM' && hour === 12) hour = 0;
	return hour * 60 + minute;
}

function parse_days(str) {
	const map = { M: 'Mon', T: 'Tue', W: 'Wed', R: 'Thu', F: 'Fri', S: 'Sat', U: 'Sun' };
	const char_array = [...str.trim()];
	return char_array.map((char) => map[char]).filter((char) => char);
}

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

const RAD_TO_DEG = Math.PI / 180;
const EARTH_RADIUS_KM = 6371.0;
function haversine_distance(lat1, lng1, lat2, lng2) {
	const dlat = (lat2 - lat1) * RAD_TO_DEG;
	const dlon = (lng2 - lng1) * RAD_TO_DEG;
	const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1 * RAD_TO_DEG) * Math.cos(lat2 * RAD_TO_DEG) * Math.sin(dlon / 2) ** 2;
	return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function time_between_buildings(mode, coords1, coords2) {
	const km = haversine_distance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
	const speeds = { walk: 4.2 / 60, bike: 18.0 / 60, bus: 39.0 / 60 };
	return km / speeds[mode];
}

// Page routes 
const PAGE_ROUTES = [
	{
		// /course/:section_id 
		pattern: /^\/course\/(.+)$/,
		handler: async (match) => {
			const section_id = match[1];
			const course_id = decodeURIComponent(section_id).replace(/\|/g, '|');
 
			const [subject, catalog_nbr] = course_id.split('|');
			if (!subject || !catalog_nbr) return;
			const api_course_id = `${subject}-${catalog_nbr}`;
 
			$.getJSON(`/api/courses/${encodeURIComponent(api_course_id)}`, (course) => {
				// class details panel
				$('.class-details-panel').html(`
					<p><strong>Credits:</strong> ${course.Credits ?? 'N/A'}</p>
					<p><strong>Level:</strong> ${uppercase_to_pascal_case(course.Level ?? '')}</p>
					<p><strong>Status:</strong> ${course.overallStatus ?? 'N/A'}</p>
				`);
 
				// availability panel
				const avail_rows = (course.classTimes ?? []).map((ct) => `
					<tr>
						<td>${ct.sectionNumber}</td>
						<td>${ct.capacity}</td>
						<td>${ct.enrolled}</td>
						<td>${ct.capacity - ct.enrolled}</td>
						<td>${ct.waitlistCount}</td>
						<td>${ct.status}</td>
					</tr>`).join('');
				$('.class-availability-panel').html(`
					<table class="table table-sm table-striped">
						<thead class="table-dark"><tr>
							<th>Section</th><th>Capacity</th><th>Enrolled</th>
							<th>Available</th><th>Waitlist</th><th>Status</th>
						</tr></thead>
						<tbody>${avail_rows}</tbody>
					</table>`);
			});
		},
	},
	{
		// /view-courses
		pattern: /^\/view-courses$/,
		handler: async () => {
			const student_id = await get_student_id();
			if (!student_id) return;
 
			const params = new URLSearchParams(window.location.search);
			const extra = params.get('courses');
			const additional_course_ids = extra ? extra.split(',').map((s) => s.trim()).filter(Boolean) : [];
 
			$.ajax({
				url: `/api/students/${student_id}/map`,
				method: 'GET',
				contentType: 'application/json',
				data: additional_course_ids.length ? JSON.stringify({ additional_course_ids }) : undefined,
				success: (courses) => {
					render_schedule(courses);
					render_course_map(courses);
				},
			});
		},
	},
	{
		// /manage-courses
		pattern: /^\/manage-courses$/,
		handler: async () => {
			const student_id = await get_student_id();
			if (!student_id) return;
 
			const params = new URLSearchParams(window.location.search);
 
			// Enroll
			const enroll_id = params.get('enroll');
			if (enroll_id) {
				$.ajax({
					url: `/api/students/${student_id}/courses/${encodeURIComponent(enroll_id)}/enroll`,
					method: 'POST',
					success: () => console.log(`Enrolled in ${enroll_id}`),
					error: (xhr) => console.error('Enroll failed:', xhr.responseJSON?.error),
				});
			}
 
			// Drop
			const drop_id = params.get('drop');
			if (drop_id) {
				$.ajax({
					url: `/api/students/${student_id}/courses/${encodeURIComponent(drop_id)}/drop`,
					method: 'DELETE',
					success: () => console.log(`Dropped ${drop_id}`),
					error: (xhr) => console.error('Drop failed:', xhr.responseJSON?.error),
				});
			}
 
			// Waitlist add
			const waitlist_id = params.get('waitlist');
			if (waitlist_id) {
				$.ajax({
					url: `/api/students/${student_id}/waitlist/${encodeURIComponent(waitlist_id)}`,
					method: 'POST',
					success: () => console.log(`Added to waitlist for ${waitlist_id}`),
					error: (xhr) => console.error('Waitlist add failed:', xhr.responseJSON?.error),
				});
			}
 
			// Waitlist remove
			const unwaitlist_id = params.get('unwaitlist');
			if (unwaitlist_id) {
				$.ajax({
					url: `/api/students/${student_id}/waitlist/${encodeURIComponent(unwaitlist_id)}`,
					method: 'DELETE',
					success: () => console.log(`Removed from waitlist for ${unwaitlist_id}`),
					error: (xhr) => console.error('Waitlist remove failed:', xhr.responseJSON?.error),
				});
			}
		},
	},
	{
		// /notifications
		pattern: /^\/notifications$/,
		handler: async () => {
			const student_id = await get_student_id();
			if (!student_id) return;
 
			$.getJSON(`/api/students/${student_id}/notifications`, (notifications) => {
				if (!notifications.length) {
					$('#notifications-list').html('<p class="text-muted">No notifications.</p>');
					return;
				}
				const items = notifications
					.slice()
					.reverse()
					.map((n) => `
						<div class="notification-item border rounded p-3 mb-2 ${n.read ? 'text-muted' : 'fw-semibold'}">
							<div>${n.message}</div>
							<div class="small text-muted mt-1">${new Date(n.date).toLocaleString()}</div>
						</div>`)
					.join('');
				$('#notifications-list').html(items);
			});
 
			$.getJSON(`/api/students/${student_id}/notifications/unread`, ({ unread }) => {
				$('#unread-count').text(unread > 0 ? `(${unread} unread)` : '');
			});
		},
	},
];
 
$(document).ready(() => {
	const pathname = window.location.pathname;
	for (const route of PAGE_ROUTES) {
		const match = pathname.match(route.pattern);
		if (match) {
			route.handler(match);
			break;
		}
	}
});
