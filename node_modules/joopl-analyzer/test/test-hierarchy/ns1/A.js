(function(){
	$namespace.using("joopl.analyzer.ns1", function(ns1) {
	    ns1.declareClass("A", {
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