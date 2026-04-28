const fs = require('fs');

function readDB(path) {
	return JSON.parse(fs.readFileSync(path));
}

// initializes a queue for each write request
const writeQueues = new Map();

function flushQueue(path) {
	const queue = writeQueues.get(path);
	if (!queue || queue.length === 0) return;

	const { data, resolve, reject } = queue[0];

	try {
		fs.writeFileSync(path, JSON.stringify(data, null, 2));
		resolve();
	} catch (err) {
		reject(err);
	} finally {
		queue.shift();
		if (queue.length > 0) {
			setImmediate(() => flushQueue(path));
		}
	}
}

// returns a promise that resolves once write is done
function writeDB(path, data) {
	return new Promise((resolve, reject) => {
		if (!writeQueues.has(path)) {
			writeQueues.set(path, []);
		}

		const queue = writeQueues.get(path);
		const wasIdle = queue.length === 0;

		queue.push({ data, resolve, reject });

		if (wasIdle) {
			flushQueue(path);
		}
	});
}

module.exports = { readDB, writeDB };
