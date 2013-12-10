(function(){
	$namespace.register("joopl.analyzer.ns1", function() {
		this.declareClass("B", {
			inherits: this.A,
			members: {
				do1: function() {
					return "A: do 1";
				}, 

				do3: function() {
					return this.do1() + " (from B: do 3)";
				}
			}
		});
	});
})();