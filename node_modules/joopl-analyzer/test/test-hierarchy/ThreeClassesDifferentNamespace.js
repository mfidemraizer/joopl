$namespace.using("threeclasstest1", function(test1) {
	test1.declareClass("A", {

	});
});

$namespace.using("threeclasstest2", "threeclasstest1", function(test2, test1) {
	test2.declareClass("B", {
		inherits: test1.A
	});
});

$namespace.using("threeclasstest3", "threeclasstest2", function(test3, test2) {
	test3.declareClass("C", {
		inherits: test2.B
	});
});