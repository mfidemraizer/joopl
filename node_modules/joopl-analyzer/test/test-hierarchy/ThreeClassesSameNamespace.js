$namespace.using("threeclasstest", function(test) {
	test.declareClass("A", {

	});
});

$namespace.using("threeclasstest", function(test) {
	test.declareClass("B", {
		inherits: test.A
	});
});

$namespace.using("threeclasstest", function(test) {
	test.declareClass("C", {
		inherits: test.B
	});
});