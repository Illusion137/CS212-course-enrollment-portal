require('dotenv').config;
const express = require('express');
const app = express();

const port = process.env.PORT ?? 3000;

app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');

app.use('/', (req, res) => {
	res.status(404).render('pages/not_found');
});
app.use((req, res) => {
	res.status(404).render('pages/not_found');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
