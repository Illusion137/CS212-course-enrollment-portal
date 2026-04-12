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

app.use('/', (req, res) => {
	res.status(404).render('pages/catalog', { title: 'Catalog', search_filters });
});
app.use((req, res) => {
	res.status(404).render('pages/not_found', { title: 'Not Found' });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
