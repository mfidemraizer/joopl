"use strict";

(function (undefined) {
    module("Namespaces");
    
    test("Register namespace", function () {
        $namespace.register("joopltest");

        ok($global.joopltest != undefined, "'joopl test' namespace not registered!");
    });

    test("Register nested namespace", function () {
        $namespace.register("joopltest.nested");

        ok($global.joopltest.nested != undefined, "Could not register a nested namespace");

        $namespace.register("joopltest.nested.nested2");

        ok($global.joopltest.nested.nested2 != undefined, "Could not register a nested namespace");
    });

    test("Register a namespace and create a namespace scope (namespace will be 'this' inside the scoped function)", function () {
        $namespace.register("joopltest.scoped", function () {
            ok($global.joopltest.scoped == this, "Scoped namespace is not represented by the 'this' keyword!");
        });
    });

    test("Import members from an unexisting namespace - it must fail -", function () {
        throws(
            function () { $namespace.using(["blah.blih"]); },
            "It must not be possible to import members from an unexisting namespace"
        );
    });
})(undefined);