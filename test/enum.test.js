(function (undefined) {
    "use strict";

    module("Enumerations");

    test("Define an enumeration. Enumeration values must be accessible after its definition", function () {
        $namespace.register("enumtest1", function () {
            this.declareEnum("State", {
                open: 1,
                closed: 2
            });
        });

        $namespace.using("enumtest1", function () {
            ok(this.State.open == 1, "Expected enum value is 0");
            ok(this.State.closed == 2, "Expected enum value is 1");
        });
    });

    test("Define an enumeration. Play with flags", function () {
        $namespace.register("enumtest2", function () {
            this.declareEnum("State", {
                open: 1,
                closed: 2
            });
        });

        $namespace.using("enumtest2", function () {
            var openAndClosed = this.State.open.enum.or(this.State.closed);

            ok(openAndClosed.enum.hasFlag(this.State.open), "The flag must be correctly evaluated");
        });
    });

    test("Define an enumeration. Parse a name into a value of the defined enumeration.", function () {
        $namespace.register("enumtest3", function () {
            this.declareEnum("State", {
                none: 0,
                open: 1,
                closed: 2,
                dead: 4
            });
        });

        $namespace.using("enumtest3", function () {
            var result = $global.joopl.Enum.parseName(this.State, "closed");

            ok(result == this.State.closed, "Parsed value is one of the defined enumeration");

            result = $global.joopl.Enum.parseNames(this.State, "open,closed");

            ok(result.hasFlag(this.State.open) && result.hasFlag(this.State.closed));
        });
    });
})(undefined);