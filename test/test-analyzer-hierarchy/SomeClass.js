(function(){
	$namespace.register("joopl.analyzer", function() {
		$namespace.using("joopl.analyzer.ns1", function(ns1) {
			this.declareClass("SomeClass", {
				ctor: function() {
					this._.b = new this.B();
				},
				members: {
					get b() {
						return this._.b;
					}
				}
			});
		});
	});
})();