(function(){
    $namespace.using("joopl.analyzer.ns2", function (ns2) {
        ns2.declareClass("A", {
			members: {
				do1: function() {
					return "A: do 1";
				}, 

				do2: function() {
					return "A: do 2";
				}
			}
		});
	});
})();