$namespace.using("joopl.analyzer", "joopl.analyzer.ns1", "joopl.analyzer.ns2", function (analyzer, ns1, ns2) {
    analyzer.declareClass("SomeClass", {
        inherits: ns2.B,
        ctor: function () {
            this._.b = new ns1.B();
        },
        members: {
            get b() {
                return this._.b;
            }
        }
    });
});