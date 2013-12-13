$namespace.using("joopl.analyzer.ns1", "joopl.analyzer.ns2", "joopl.analyzer.ns3", "joopl.analyzer.ns4", function (ns1, ns2, ns3, ns4) {
    ns4.declareClass("SomeClass", {
        members: {
            get a() {
                var a = new ns1.A();
                var b = new ns1.B();
            },

            set a(val) {
                this._.a = new ns3.C(); 
            },

            do: function() {
                var b = new ns2.B();
            }
        }
    });
});