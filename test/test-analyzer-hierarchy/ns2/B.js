(function(){
	$namespace.register("joopl.analyzer.ns2", function() {
		this.declareClass("B", {
			inherits: this.A,
			members: {
				do1: function() {
					return this.type.fullName + ": do 1";
				}, 

				do3: function() {
					return this.do1() + " (from " + this.type.fullName + ": do 3)";

					// This should generate a dependency on B but from joopl.analyzer.ns1 namespace
					new $global.joopl.analyzer.ns1.B();
				}
			}
		});
	});
})();