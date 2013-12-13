(function(){
    $namespace.using("joopl.analyzer.ns1", function (ns1) {
        ns1.declareClass("B", {
            inherits: ns1.A,
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