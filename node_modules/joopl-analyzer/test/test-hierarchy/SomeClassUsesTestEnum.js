$namespace.using("joopl.analyzer.ns5", "joopl.analyzer.ns6", function (ns5, ns6) {
    ns6.declareClass("SomeClass", {
        members: {
            get b() {
                var enumValue1 = ns5.TestEnum.open;
                var enumValue2 = ns5.TestEnum.closed;
                var enumValue3 = ns5.TestEnum.whoKnows;
            }
        }
    });
});