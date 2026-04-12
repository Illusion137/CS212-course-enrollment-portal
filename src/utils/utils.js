function create_section_id(course_subject, course_nbr, section_nbr) {
	return `${course_subject}|${course_nbr}|${section_nbr}`;
}
function parse_section_id(section_id) {
	const [course_subject, course_nbr, section_nbr] = section_id.split('|');
	return { course_subject, course_nbr, section_nbr };
}

module.exports = { create_section_id, parse_section_id };
