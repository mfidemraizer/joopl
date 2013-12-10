(function(){
	$namespace.register("joopl.analyzer.ns1", function() {
		this.declareClass("A", {
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