let campus_map = null;
let map_layers = [];
let map_courses = [];

const NAU_COORDINATE_BOUNDS = L.latLngBounds([35.17, -111.668], [35.2, -111.642]);

const DAYS_LIST = ['M', 'T', 'W', 'R', 'F'];
const DAY_KEY_LABELS = { M: 'Mon', T: 'Tue', W: 'Wed', R: 'Thu', F: 'Fri' };

const BUILDING_COLOR_MAP = {
	SICCS: '#4f8ef7',
	Engineering: '#e8503a',
	'Physical Sciences': '#f5a623',
	'Science Laboratory': '#34c77b',
	'Science Annex': '#e056a0',
	'Science and Health': '#a259f7',
	'Biological Sciences Annex': '#1ec8c8',
	'Chemistry & Biochemistry': '#f76b4f',
	'Adel Mathematics': '#3ab5e8',
	'Southwest Forest Sci': '#6dbf3e',
	'Geology Annex': '#c97c2e',
	'SBS-Raul H. Castro': '#e84f91',
	'SBS West': '#7b5ea7',
	'W.A.FrankeCollBusiness': '#e8b034',
	'Liberal Arts': '#3ecfa3',
	'Department of English': '#f74f6b',
	'School of Communication': '#4fb3f7',
	'College of Education': '#d45fe8',
	'Kitt School of Music': '#e87c3e',
	'Clifford White Theater': '#5ea7e8',
	'Ardrey Auditorium': '#8bc34a',
};

function direction_between_coordinates(latitude_1, longitude_1, latitude_2, longitude_2) {
	const delta_longitude = ((longitude_2 - longitude_1) * Math.PI) / 180;
	const radians_latitude_1 = (latitude_1 * Math.PI) / 180,
		radians_latitude_2 = (latitude_2 * Math.PI) / 180;
	const y = Math.sin(delta_longitude) * Math.cos(radians_latitude_2);
	const x = Math.cos(radians_latitude_1) * Math.sin(radians_latitude_2) - Math.sin(radians_latitude_1) * Math.cos(radians_latitude_2) * Math.cos(delta_longitude);
	return (Math.atan2(y, x) * 180) / Math.PI;
}

// icon from https://icons.getbootstrap.com/icons/arrow-up/
function make_arrow_icon(rotate_degrees) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" style="transform:rotate(${rotate_degrees}deg);overflow:visible">
	  	<path fill="#1f2434" fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/>
	</svg>`;
	return L.divIcon({ html: svg, iconSize: [18, 18], iconAnchor: [9, 9], className: '' });
}

// icon from https://icons.getbootstrap.com/icons/geo-alt-fill/
function make_pin_icon(color, thickness = 0.5) {
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 16 16">
	  	<path fill="${color}" stroke="black" stroke-width="${thickness}" d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
	</svg>`;
	return L.divIcon({ html: svg, iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -28], className: '' });
}

function add_building_marker(building, index) {
	const DEFAULT_COLOR = '#ea8cff';
	const color = BUILDING_COLOR_MAP[building.coords.key] || DEFAULT_COLOR;
	const popup = $('<div>').append(
		$('<strong>').css('font-size', '15px').text(building.coords.key),
		building.courses.map((course) => $('<div>').css({ 'font-size': '13px', 'margin-top': '3px', color: '#444' }).text(course.label))
	);
	const marker = L.marker([building.coords.lat, building.coords.lng], { icon: make_pin_icon(color, index === 0 ? 2 : 0.5) });
	marker.bindPopup(popup[0], { maxWidth: 220 }).addTo(campus_map);
	map_layers.push(marker);
}

function add_route_segment(from, to) {
	const line = L.polyline(
		[
			[from.lat, from.lng],
			[to.lat, to.lng],
		],
		{ color: '#1f2434', weight: 2.5, dashArray: '7 5', opacity: 0.75 }
	).addTo(campus_map);
	map_layers.push(line);

	const midpoint = [(from.lat + to.lat) / 2, (from.lng + to.lng) / 2];

	const arrow = L.marker(midpoint, { icon: make_arrow_icon(direction_between_coordinates(from.lat, from.lng, to.lat, to.lng)) }).addTo(campus_map);
	map_layers.push(arrow);
}

function render_map_layers(courses, show_arrows) {
	for (const layer of map_layers) {
		campus_map.removeLayer(layer);
	}
	map_layers = [];

	const sorted_courses = show_arrows ? courses.slice().sort((a, b) => parse_time(a.startTime) - parse_time(b.startTime)) : courses;

	const buildings = {};
	for (const course of sorted_courses) {
		const coords = get_building_coords(course.room);
		if (!coords) continue;
		if (!buildings[coords.key]) buildings[coords.key] = { coords: coords, courses: [] };
		buildings[coords.key].courses.push(course);
	}

	const building_list = Object.values(buildings);
	for (const [i, building] of Object.entries(building_list)) {
		add_building_marker(building, i);
	}

	if (show_arrows) {
		for (const [i, building] of building_list.slice(0, -1).entries()) {
			add_route_segment(building.coords, building_list[i + 1].coords);
		}
	}
}

function render_map_for_day(day) {
	const courses = day ? map_courses.filter((course) => course.days && course.days.includes(day)) : map_courses;
	render_map_layers(courses, !!day);
	$('.map-day-tab').each(function () {
		$(this).toggleClass('active', $(this).data('day') === (day || 'all'));
	});
}

function make_day_tab(tab) {
	return $('<button>')
		.addClass('map-day-tab')
		.attr('data-day', tab.day || 'all')
		.text(tab.label)
		.on('click', () => render_map_for_day(tab.day));
}

function render_course_map(courses) {
	map_courses = courses;

	if (!campus_map) {
		campus_map = L.map('campus-map', {
			maxBounds: NAU_COORDINATE_BOUNDS,
			maxBoundsViscosity: 1.0,
			minZoom: 15,
		}).setView([35.184, -111.656], 15);
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
			maxZoom: 19,
		}).addTo(campus_map);

		const map_container = campus_map.getContainer();
		map_container.focus = function () {
			HTMLElement.prototype.focus.call(this, { preventScroll: true });
		};
	}

	const active_days = DAYS_LIST.filter((day) => courses.some((course) => course.days && course.days.includes(day)));
	const mapped_tabs = active_days.map((day) => ({ day, label: DAY_KEY_LABELS[day] }));

	const map_day_tabs = $('#map-day-tabs').empty();
	const tabs_data = [{ day: null, label: 'All' }].concat(mapped_tabs);
	for (const tab of tabs_data) {
		map_day_tabs.append(make_day_tab(tab));
	}

	render_map_for_day(tabs_data[0].day);
}
