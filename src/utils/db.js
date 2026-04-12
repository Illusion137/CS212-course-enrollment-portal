const fs = require('fs');

function readDB(path) {
	return JSON.parse(fs.readFileSync(path));
}

function writeDB(path, data) {
	fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
