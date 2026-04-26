const { readDB, writeDB } = require('../utils/db');
const path = require('path');

const OVERRIDES_DB = path.join(__dirname, '../db/overrides.json');

function getAllOverrides() {
	return readDB(OVERRIDES_DB);
}

function saveOverrides(overrides) {
	writeDB(OVERRIDES_DB, overrides);
}

module.exports = {
	getAllOverrides,
	saveOverrides
};
