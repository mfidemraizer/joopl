(function (undefined) {
    "use strict";

    module("Enumerations");

    test("Define an enumeration. Enumeration values must be accessible after its definition", function () {
        $namespace.using("enumtest1", function (ns) {
            ns.declareEnum("State", {
                open: 1,
                closed: 2
            });
        });

        $namespace.using("enumtest1", function (ns) {
            ok(ns.State.open == 1, "Expected enum value is 0");
            ok(ns.State.closed == 2, "Expected enum value is 1");
        });
    });

    test("Define an enumeration. Play with flags", function () {
        $namespace.using("enumtest2", function (ns) {
            ns.declareEnum("State", {
                open: 1,
                closed: 2
            });
        });

        $namespace.using("enumtest2", function (ns) {
            var openAndClosed = ns.State.open.enum.or(ns.State.closed);

            ok(openAndClosed.enum.hasFlag(ns.State.open), "The flag must be correctly evaluated");
        });
    });

    test("Define an enumeration. Parse a name into a value of the defined enumeration.", function () {
        $namespace.using("enumtest3", function (ns) {
            ns.declareEnum("State", {
                none: 0,
                open: 1,
                closed: 2,
                dead: 4
            });
        });

        $namespace.using("enumtest3", function (ns) {
            var result = $global.joopl.Enum.parseName(ns.State, "closed");

            ok(result == ns.State.closed, "Parsed value is one of the defined enumeration");

            result = $global.joopl.Enum.parseNames(ns.State, "open,closed");

            ok(result.hasFlag(ns.State.open) && result.hasFlag(ns.State.closed));
        });
    });
})(undefined);