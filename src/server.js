require('dotenv').config;
const express = require('express');
const express_layouts = require('express-ejs-layouts');
const app = express();

const port = process.env.PORT ?? 3000;

app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.use(express_layouts);

const search_filters = {
	CS: {
		long_title: 'CS - Computer Science',
		course_numbers: ['136', '136L', '105', '205', '305', '249'],
	},
};

// FIXME Yall do this however yall want, just a temp placeholder :3
const all_courses = {
	'CS 136': {
		subject: 'CS',
		course_nbr: '136',
		title: 'C Programming',
	},
};
const all_course_sections = {
	36780: {
		course: all_courses['CS 136'],
	},
};

// FIXME Same for here, these are just here so I can test, but yall do whatever yall want with this as long as it works
app.get('/', (req, res) => {
	res.render('pages/catalog', { title: 'Catalog', search_filters });
});
app.get('/course/:section_id', (req, res) => {
	const { section_id } = req.params;
	const section = all_course_sections[section_id];
	res.render('pages/course_details', { title: section.course.title, section });
});
app.get('/view-courses', (req, res) => {
	res.render('pages/view_courses', { title: 'View Courses' });
});
app.get('/manage-courses', (req, res) => {
	res.render('pages/manage_courses', { title: 'Manage Courses' });
});
app.get('/notifications', (req, res) => {
	res.render('pages/notifications', { title: 'Notifications' });
});
app.get('/override', (req, res) => {
	res.render('pages/override', { title: 'Course Override' });
});
app.use((req, res) => {
	res.status(404).render('pages/not_found', { title: 'Not Found' });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
