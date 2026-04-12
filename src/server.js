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
		title: 'C Programming',
	},
};

// FIXME Same for here, these are just here so I can test, but yall do whatever yall want with this as long as it works
app.use('/', (req, res) => {
	res.render('pages/catalog', { title: 'Catalog', search_filters });
});
app.use('/course/:course_id', (req, res) => {
	const { course_id } = req.params;
	const course = all_courses[course_id];
	res.render('pages/catalog', { title: 'Catalog', course });
});
app.use('/view-courses', (req, res) => {
	res.render('pages/view_courses', { title: 'View Courses' });
});
app.use('/manage-courses', (req, res) => {
	res.render('pages/manage_courses', { title: 'Manage Courses' });
});
app.use('/notifications', (req, res) => {
	res.render('pages/notifications', { title: 'Notifications' });
});
app.use('/override', (req, res) => {
	res.render('pages/override', { title: 'Course Override' });
});
app.use((req, res) => {
	res.status(404).render('pages/not_found', { title: 'Not Found' });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
