require('dotenv').config;
const express = require('express');
const app = express();

const port = process.env.PORT ?? 3000;

app.use(express.static('public'));
app.use(express.json());

app.use('/', (req, res) => {
	res.sendFile('index.html', { root: './views' });
});
app.use((req, res) => {
	res.status(404).sendFile('not_found.html', { root: './views' });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
