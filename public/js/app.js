function uppercase_to_pascal_case(str) {
	return str
		.split(' ')
		.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}
