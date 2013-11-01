/**
    The `$namespace` keyword represents an static object holding methods/functions to manage namespaces.

    *If you are looking for code samples, <a href="../test/namespace.test.html" target="_blank">opening `$namespace` tests</a> and browsing their source code could be a good idea!*

    ### What is a namespace?
    <p>A namespace is an identifier holding zero or more members like classes and enumerations. </p>

    <p>In object-oriented programming namespaces are a key and strong feature, since it prevents name collisions: for example, two or more classes can live 
    into the same code library, but since each one belongs to a different namespace, this can happen with no issues:</p>

        MyNamespace.Class1
        MyNamespace.MyOtherNamespace.Class1
        MyNamespace.AnotherNamespace.Class1
        YetAnotherNamespace.Class1

    <p>Namespaces <strong>must be defined using the <a href="#method_register">$namespace.register</a></strong> method.</p>

    <p>Once some code requires to use these classes, it can access the right class by using the full namespace path:</p>

        var instance = new $global.MyNamespace.Class1();
        var instance2 = new $global.$MyNamespace.MyOtherNamespace.Class1();
        var instance3 = new $global.$MyNamespace.AnotherNamespace.Class1();
        var instance4 = new $global.YetAnotherNamespace.Class1();

    <p>This is very useful in order to let different JavaScript libraries define classes with exactly the same name but doing absolutely different things. Namespaces
    isolate each one.</p>

    ### How to register a namespace
    The second use case of the `$namespace.register` is the most powerful one: both register the whole namespace and add members to the
    it in the same operation and with a shorter syntax. 

    `$namespace.register` supports a second parameter in addition to the namespace path called `scopedFunc`. It is a parameterless function that, when
    executed,  the `this` keyword in the scope of the function (i.e. *the function body*) will be the childest registered namespace. For example:

        $namespace.register("joopl.samples", function() {
            // The this keyword now is the 'samples' namespace! 
            // That's great because there is no need to access to the full namespace path
            // to work on adding members to it!
            this.declareClass("A", {
                members: {
                    someMethod: function() {
                        return "hello world";
                    }
                }
            })
        });

    <h3 id="namespace-global">The $global namespace</h3>
    <p>jOOPL has a top-most namespace called `$global`. Any namespace registered using the whole `$namespace.register(...)` method will be nested into the
    `$global` namespace.</p>
    <p>As JavaScript top-most object is the `Window` object and any variable or function defined in the global scope belongs to `Window`, this can lead to
    bad practices, because more than a JavaScript library may define the same variable names, functions and other constructs. jOOPL isolates any member
    defined by itself in the `$global` namespace in order to prevent issues with other libraries.</p>

    ###Importing one or more namespaces
    ####1. Importing all members from some given namespaces into a variable
    If the `$namespace.using` method is called only giving the first input parameter `paths` (*an arrary of strings where each index is a namespace path*).

    That is, if a namespace has been previously registered this way in some JavaScript file:
        $namespace.register("joopl.samples");
        $namespace.register("jooopl.samples.ui");

    ...`$namespace.using` would be used like this:

    var importedMembers = $namespace.using(["joopl.samples", "joopl.samples.ui"]);

    The `importedMembers` variable will hold *all* imported classes or enumerations within the `samples` and `ui` namespaces.

    ####2. Importing all members in a scoped function
    The second use case is importing members from some given namespaces into a scoped function:

        $namespace.register("joopl.samples", function() {
            this.declareClass("ClassA", {
                members: {
                    someMethod: function() {
                    }
                }
            });
        });

        // Somewhere in the same or other file...
        $namespace.using(["joopl.samples", "joopl.samples.ui"], function() {
            // The "this" keyword contains an object with all imported members from the both namespaces
            var instance = new this.ClassA();
        });

    In addition, there is a variation: if the scoped function has a single input parameter, jOOPL will import all members into the whole input argument
    and the `this` keyword will hold the `$global` namespace object:

        $namespace.using(["joopl.samples", "joopl.samples.ui"], function(scope) {
            // The scope input argument will hold the imported members
            var instance = new scope.ClassA();
        });

    @class $namespace
*/

/**
   Registers a namespace.

   @method register
   @param path {String} A namespace path. For example, "joopl.sample" will register "joopl" and its child "sample". 
   @param scopedFunc {Function} A parameterless function representing the scope where the `this` keyword is the childest registered namespace (for example, registering "joopl.sample', the `this` keyword will be the *sample* namespace).
*/

/**
    Imports the members of given namespace path. 

    The `$namespace.using` method will not register a namespace if a given namespace path is not previously registered with `$namespace.register`.

    @method using
    @param paths {Array|string} An array of strings of the namespaces to import, or just a string with a single namespace path.
    @param scopedFunc {Function} A function to create a namespace scope (optional)
    @param scopeIsNs {boolean} USED BY THE SYSTEM. IT IS NOT RECOMMENDED FOR DEVELOPERS. A boolean flag specifying if the this keyword in the scoped function must be the childest namespace or not (optional)
*/