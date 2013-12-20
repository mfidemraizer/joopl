(function (undefined) {
    "use strict";

    module("Class attributes");

    test("Define a new class with attributes. Check that the given attributes are present", function () {
        $namespace.using("jooplattributetest", function (ns) {
            ns.declareClass("TestAttr", {
                inherits: $global.joopl.Attribute,
                ctor: function (args) {
                    this.base.ctor(args);
                },
                members: {
                    get testData() { return "hello world"; }
                }
            });

            ns.declareClass("A", {
                attributes: [new ns.TestAttr()]
            });

            ok(ns.A.type.hasAttribute(ns.TestAttr), "The test class must contain the attribute");
            ok(ns.A.type.getAttribute(ns.TestAttr).testData == "hello world");
        });
    });

    test("Define a new class with attributes. Adding instances that are not Attribute must fail", function () {
        $namespace.using("jooplattributetest2", function (ns) {
            ns.declareClass("TestAttr", {
                ctor: function (args) {
                    this.base.ctor(args);
                },
                members: {
                    get testData() { return "hello world"; }
                }
            });

            throws(function () {
                ns.def("A", {
                    attributes: [new ns.TestAttr()]
                });
            });
        });
    });

    module("Class declaration");

    test("Define a new class, instantiate it and test if its methods and properties are working", function () {
        $namespace.using("classtest1", function (ns) {
            ns.declareClass("A", {
                ctor: function () {
                    this._.value = null;
                },
                members: {
                    get value() {
                        return this._.value;
                    },

                    set value(val) {
                        this._.value = val;
                    },

                    get fixedValue() {
                        return 28;
                    },

                    someMethod: function () {
                        return 11;
                    }
                }
            });
        });

        $namespace.using("classtest1", function (ns) {
            var instance = new ns.A();
            instance.value = "hello world";

            ok(instance.value == "hello world", "Some read-write property accessor holds the expected value!");
            ok(instance.fixedValue == 28, "Some read-only property accessor holds the expected value!");
            ok(instance.someMethod(), "A defined method returns the expected value!");
        });
    });

    module("Class inheritance");

    test("Define a new class, instantiate it and test if each instance do not share the class field reference", function () {
        $namespace.using("classtest2", function (ns) {
            ns.declareClass("A", {
                ctor: function () {
                    this._.value = [];
                },

                members: {
                    get value() {
                        return this._.value;
                    }
                }
            });
        });

        $namespace.using("classtest2", function (ns) {
            var instance = new ns.A();
            var instance2 = new ns.A();

            instance.value.push("hello world");

            ok(instance2.value.length == 0, "The second instance has an array property with zero indexes");
        });
    });

    test("Create an inheritance and check that all members are present in the inherited class and they are also working as expected", function () {
        $namespace.using("joopltest", function (ns) {
            ns.declareClass("A", {
                ctor: function () {
                    this._.value = null;
                    this._.value2 = "read-only value";
                },

                members: {
                    get value() {
                        return this._.value;
                    },

                    set value(val) {
                        this._.value = val;
                    },

                    get readOnlyValue() {
                        return this._.value2;
                    },

                    someMethod: function () {
                        return 11;
                    }
                }
            });


            ns.declareClass("B", {
                inherits: ns.A,
                ctor: function () {
                    var b = null;
                    this.base.ctor();
                },
                members: {
                    someMethod2: function () {
                        return 22;
                    }
                }
            });

            ns.declareClass("C", {
                ctor: function () {
                    this.base.ctor();
                },
                inherits: ns.B
            });

            var instanceOfC = new ns.C();
            instanceOfC.value = "hello world";

            ok(instanceOfC.value == "hello world", "Read-write property from the super class is still accessible");
            ok(instanceOfC.readOnlyValue == "read-only value", "Read-only property from the super class is still accessible");
            ok(instanceOfC.someMethod() == 11, "Inherited method is accessible");
            ok(instanceOfC.someMethod2() == 22, "Inherited method is accessible");
        });

        test("Create an inheritance  (B inherits A, C inherits B) and check that the most specialized class in the hierarchy is still of type of its base ones", function () {
            $namespace.using("joopltest2", function (ns) {
                ns.declareClass("A");

                ns.declareClass("B", {
                    inherits: ns.A
                });

                ns.declareClass("C", {
                    inherits: ns.B
                });

                var instanceOfC = new ns.C();

                ok(instanceOfC.isTypeOf(ns.C), "The instance of derived class is correctly detected as of type of its class (it is instance of C)");
                ok(instanceOfC.isTypeOf(ns.B), "The instance of derived class is correctly detected as of type of one of its base classes (it is instance of B)");
                ok(instanceOfC.isTypeOf(ns.A), "The instance of derived class is correctly detected as of type of one of its base classes (it is instance of A)");
            });
        });

        test("Create an inheritance with polymorphism and check that the polymorphic method and property are worked as expected", function () {
            $namespace.using("classpolymorphismtest", function (ns) {
                ns.declareClass("A", {
                    ctor: function () {
                        this._.value = "hello world";
                    },
                    members: {
                        get value() {
                            return this._.value;
                        },

                        someMethod: function () {
                            return this._.value;
                        }
                    }
                });

                ns.declareClass("B", {
                    inherits: ns.A,
                    ctor: function () {
                        this.base.ctor();
                    },
                    members: {
                        get value() {
                            return this.base.value + "!";
                        },

                        someMethod: function () {
                            return this.base.value + "!";
                        }
                    }
                });

                ns.declareClass("C", {
                    inherits: ns.B,
                    ctor: function () {
                        this.base.ctor();
                    },
                    members: {
                        get value() {
                            return this.base.value + "!";
                        },

                        someMethod: function () {
                            return this.base.value + "!";
                        }
                    }
                });
            });

            $namespace.using("classpolymorphismtest", function (ns) {
                var instanceOfC = new ns.C();

                ok(instanceOfC.value == "hello world!!", "The polymorphic property has the expected value when it is accessed");
                ok(instanceOfC.someMethod() == "hello world!!", "The polymorphic method has the expected value when it is accessed");
            });
        });

        test("A base class has a polymorphic method. The base class will be inherited by others and the polymorphic method will be called in the base class like an abstract method", function () {
            $namespace.using("classpolymorphismtest2", function (ns) {
                ns.declareClass("A", {
                    ctor: function () {
                    },
                    members: {
                    }
                });

                ns.declareClass("B", {
                    inherits: ns.A,
                    ctor: function () {
                        this.base.ctor();
                    },
                    members: {
                        get abstractProperty() {
                            throw new $global.joopl.NotImplementedException({ memberName: "abstractProperty" });
                        },

                        someMethod: function () {
                            return this.derived.abstractMethod() + this.derived.abstractProperty;
                        },

                        abstractMethod: function () {
                        }
                    }
                });

                ns.declareClass("C", {
                    inherits: ns.B,
                    ctor: function () {
                        this.base.ctor();
                    },
                    members: {

                        abstractMethod: function () {
                            return "hello world";
                        },

                        get abstractProperty() {
                            return " from property!";
                        }
                    }
                });
            });

            $namespace.using("classpolymorphismtest2", function (ns) {
                var instanceOfC = new ns.C();

                equal("hello world from property!", instanceOfC.someMethod(), "The abstract method returns the expected value called from the base class");
            });
        });

        module("Class declaration behaviors");

        test("Create an inmutable object", function () {
            $namespace.using("inmutableobjecttest", function (ns) {
                ns.declareClass("A", {
                    ctor: function () {
                        this._.classField = "hello world";
                    },
                    members: {
                        get value() { return "hello world"; },
                        set classField(val) { this._.classField = val; }
                    },
                    $inmutable: true
                });
            });

            throws(function () {
                $namespace.using("inmutableobjecttest", function (ns) {
                    var instance = new ns.A();
                    instance.some = "new property";
                });
            }, "The inmutable class instance cannot add properties once instantiated");

            throws(function () {
                $namespace.using("inmutableobjecttest", function (ns) {
                    var instance = new ns.A();

                    TypeUtil.defineProperty(instance, "value", { configurable: true });
                });

            }, "The inmutable class instance cannot redefine properties");


            throws(function () {
                "use strict";

                $namespace.using("inmutableobjecttest", function (ns) {
                    var instance = new ns.A();

                    delete instance.value;

                    if (instance.value == "hello world") {
                        throw Error("Cannot delete properties from an inmutable object!");
                    }
                });

            }, "The inmutable class instance cannot drop members");
            throws(function () {
                $namespace.using("inmutableobjecttest", function (ns) {
                    var instance = new ns.A();

                    instance.someMethod = function () { };
                });
            }, "The inmutable class cannot add methods once instantiated");

            throws(function () {
                $namespace.using("inmutableobjecttest", function (ns) {
                    var instance = new ns.A();
                    instance.some = "new property";
                });
            }, "The inmutable class instance cannot add properties once instantiated");
        });

        test("Create an non-dynamic object", function () {
            $namespace.using("nondynamicobjecttest", function (ns) {
                ns.declareClass("A", {
                    ctor: function () {
                    },
                    members: {
                        get value() { return "hello world"; },
                        set classField(val) { this._.classField = val; }
                    },
                    dynamic: false
                });
            });

            throws(function () {
                $namespace.using("nondynamicobjecttest", function (ns) {
                    var instance = new ns.A();
                    instance.some = "new property";
                });
            }, "The non-dynamic class instance cannot add properties once instantiated");

            throws(function () {
                $namespace.using("nondynamicobjecttest", function (ns) {
                    var instance = new this.A();
                    TypeUtil.defineProperty(instance, "value", { configurable: true });
                });

            }, "The non-dynamic class instance cannot redefine properties");


            throws(function () {
                "use strict";

                $namespace.using("nondynamicobjecttest", function (ns) {
                    var instance = new ns.A();
                    delete instance.value;

                    if (instance.value == "hello world") {
                        throw Error("Cannot delete properties from an inmutable object!");
                    }
                });

            }, "The non-dynamic class instance cannot drop members");

            throws(function () {
                $namespace.using("nondynamicobjecttest", function (ns) {
                    var instance = new ns.A();
                    instance.someMethod = function () { };
                });
            }, "The non-dynamic class instance cannot add methods once instantiated");
        });

        module("Events");

        test("Try to create an event and trigger it", function () {
            $namespace.using("eventtest1", function (ns) {
                ns.declareClass("A", {
                    members: {
                        events: ["click"]
                    }
                });
            });

            $namespace.using("eventtest1", function (ns) {
                var instance = new ns.A();
                var context = {};

                // Sets an event handler. Whenever a one is assigned to the event, a new handler is added. 
                instance.click.addEventListener(function (args) {
                    ok(this == context, "The context object is correctly bound to the 'this' keyword");
                    ok(args.text == "hello world", "The test event is triggered successfully");
                });

                // triggers the event!
                instance.click.raise({ args: { text: "hello world" }, $this: context });
            });
        });

        test("Try to create an event, create more than an instance of the class with the whole event and trigger it", function () {
            $namespace.using("eventtest2", function (ns) {
                ns.declareClass("A", {
                    members: {
                        events: ["click"]
                    }
                });
            });

            $namespace.using("eventtest2", function (ns) {
                var instance = new ns.A();
                var instance2 = new ns.A();

                var eventCount = 0;

                instance.click.addEventListener(function (args) {
                    eventCount++;
                });

                instance2.click.addEventListener(function (args) {
                    eventCount++;
                });

                // triggers the event!
                instance.click.raise({ args: { text: "hello world" } });

                equal(1, eventCount, "Event was handled once");
            });
        });

        test("Try to create an event, bind a handler, unbind it and trigger the event. No event handler should be bound.", function () {
            $namespace.using("eventtest3", function (ns) {
                ns.declareClass("A", {
                    members: {
                        events: ["click"]
                    }
                });
            });

            $namespace.using("eventtest3", function (ns) {
                var instance = new ns.A();
                var context = {};

                var handled = false;

                var handler = function (args) {
                    handled = true;
                };

                // Sets an event handler. Whenever a one is assigned to the event, a new handler is added. 
                instance.click.addEventListener(handler);
                instance.click.removeEventListener(handler);

                // triggers the event!
                instance.click.raise({ args: { text: "hello world" }, context: context });

                ok(!handled, "The event handler was not triggered");
            });
        });

        test("Try to create an event, create the handler in some method and trigger it", function () {
            $namespace.using("eventtest4", function (ns) {
                ns.declareClass("A", {
                    ctor: function () {
                        this.bindEvents();
                    },
                    members: {
                        events: ["saidHello"],

                        bindEvents: function () {
                            this.saidHello.addEventListener(function (args) {
                                ok(args.text == "hello world!", "The event args are the expected ones");
                            });
                        },
                        sayHello: function () {
                            this.saidHello.raise({ args: { text: "hello world!" } });
                        }
                    }
                });
            });

            $namespace.using("eventtest4", function (ns) {
                var instance = new ns.A();
                var context = {};

                instance.sayHello();
            });
        });

        test("Try to create an event and trigger it with inheritance", function () {
            $namespace.using("eventtest5", function (ns) {
                ns.declareClass("A", {
                    members: {
                        events: ["click"]
                    }
                });

                ns.declareClass("B", {
                    inherits: ns.A
                });
            });

            $namespace.using("eventtest5", function (ns) {
                var instance = new ns.B();
                var context = {};

                // Sets an event handler. Whenever a one is assigned to the event, a new handler is added. 
                instance.click.addEventListener(function (args) {
                    ok(this == context, "The context object is correctly bound to the 'this' keyword");
                    ok(args.text == "hello world", "The test event is triggered successfully");
                });

                // triggers the event!
                instance.click.raise({ args: { text: "hello world" }, $this: context });
            });
        });
    });
})(undefined);