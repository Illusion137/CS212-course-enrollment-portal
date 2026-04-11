require('dotenv').config;
const express = require('express');
const express_layouts = require('express-ejs-layouts');
const app = express();

const port = process.env.PORT ?? 3000;

app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(express_layouts);

app.use('/', (req, res) => {
	res.status(404).render('pages/not_found', { title: 'Catalog' });
});
app.use((req, res) => {
	res.status(404).render('pages/not_found', { title: 'Not Found' });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
