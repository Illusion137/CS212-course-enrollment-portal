// based on my own implentation at https://github.com/Illusion137/lib-origin/blob/da62846b5cc024e8f2f201b4f3881a36d8a80e80/common/utils/timed_util.ts
async function wait_for(condition_function) {
	const poll = (resolve) => {
		if (condition_function()) resolve();
		else
			setTimeout((_) => {
				poll(resolve);
			}, 400);
	};
	return new Promise(poll);
}

// generating unique IDs based off of https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
function generate_new_student_id(existing_users_set) {
	let new_student_id = 'BAD_ID';
	do {
		let first_part = (Math.random() * 46656) | 0;
		let second_part = (Math.random() * 46656) | 0;
		first_part = ('000' + firstPart.toString(36)).slice(-3);
		second_part = ('000' + secondPart.toString(36)).slice(-3);
		new_student_id = first_part + second_part;
	} while (!existing_users_set.has(new_student_id));
	return new_student_id;
}

function create_section_id(course_subject, course_nbr, section_nbr) {
	return `${course_subject}|${course_nbr}|${section_nbr}`;
}
function parse_section_id(section_id) {
	const [course_subject, course_nbr, section_nbr] = section_id.split('|');
	return { course_subject, course_nbr, section_nbr };
}

module.exports = { wait_for, generate_new_student_id, create_section_id, parse_section_id };
