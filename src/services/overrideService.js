const overrideModel = require('../models/overrideModel');

function createOverride(data) {
	const overrides = overrideModel.getAllOverrides();

	const newRequest = {
		id: overrides.length, 
		...data,
		date: new Date().toISOString(),
	};

	overrides.push(newRequest);

	overrideModel.saveOverrides(overrides);

	return newRequest;
}

function getAllOverrides() {
	return overrideModel.getAllOverrides();
}

module.exports = {
	createOverride,
	getAllOverrides
};