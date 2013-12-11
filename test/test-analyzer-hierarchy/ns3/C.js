(function(){
    $namespace.using("joopl.analyzer.ns3", "joopl.analyzer.ns2", function (ns3, ns2) {
        ns3.declareClass("C", {
            inherits: ns2.B,
			members: {
				do1: function() {
					return this.type.fullName + ": do 1";
				}, 

				do3: function() {
					return this.do1() + " (from " + this.type.fullName + ": do 3)";

					// This should generate a dependency on B but from joopl.analyzer.ns1 namespace
					var instanceOfBOfNs1 = new $global.joopl.analyzer.ns1.B();
					var instanceOfAOfNs2 = new ns2.A();
				}
			}
		});
	});
})();