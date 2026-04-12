require('dotenv').config();
const express = require('express');
const express_layouts = require('express-ejs-layouts');
const app = express();
const path = require('path');

const { readDB } = require('./utils/db');
const { parse_section_id } = require('./utils/utils');

const port = process.env.PORT ?? 3000;
const CATALOG = path.join(__dirname, './db/catalog.json');

// Routes
const coursesRoutes = require('./routes/courses');
const studentsRoutes = require('./routes/students');
const overridesRoutes = require('./routes/overrides');

app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.use(express_layouts);

// API routes
app.use('/api/courses', coursesRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/overrides', overridesRoutes);

app.get('/', (req, res) => {
	res.render('pages/catalog', { title: 'Catalog' });
});
app.get('/course/:section_id', (req, res) => {
	const { section_id } = req.params;
	const { course_subject, course_nbr, section_nbr } = parse_section_id(section_id);

	const catalog = readDB(CATALOG);
	const course = catalog.find((course) => course.Subject === course_subject && course.CatalogNbr === course_nbr);
	const section = course.classTimes.find((time) => time.sectionNumber === section_nbr);

	res.render('pages/course_details', { title: course.title, course, section });
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
