/**
    The `$namespace` keyword represents an static object holding methods/functions to manage namespaces.

    ## What is a *namespace*?

    A namespace is a container which may have zero or more members. Valid namespace members are:
    - Classes
    - Enumerations

    Namespaces are a simple but yet powerful way of distinguishing two ore more classes or enumerations with the same identifier. 

    For example, maybe a library should need to define two classes called 'SomeClass'. If both 'SomeClass' classes are imported in the same scope, which one
    would be the available one? Usually the last imported one, because it was the latest to be defined...

    Avoiding situation described above is as easy as just use namespacing. If both 'SomeClass' classes would be defined in different namespaces, and both
    can be referenced with their namespace plus their own class name, there is no more naming collisions! See example bellow:

        namespaceA.SomeClass
        namespaceB.SomeClass
        
        // They are both called with the same identifier, but 
        // in different namespaces, thus
        // they are different classes!
        new namespaceA.SomeClass(); 
        new namespaceB.SomeClass(); 

    ## jOOPL namespacing

    jOOPL has built-in namespacing. Namespaces can be created and/or imported by calling `$namespace.using` method/function:

        // This registers and imports "mynamespace" namespace and 
        // puts a reference to the whole namespace as an argument of the 
        // callback function found as second argument of $namespace.using
        $namespace.using("mynamespace", function(mynamespace) {
            
        });

    Also, jOOPL supports importing/registering more than a namespace at once:

        $namespace.using("mynamespace", "mynamespace2", "mynamespace3", function(mynamespace, mynamespace2, mynamespace3) {
    
        });

    `$namespace.using` can import an unlimited number of namespaces. Each one is imported in the corresponding callback function argument and by order. That is, 
    jOOPL will not care about function argument name, _but a right naming scheme will enforce code readability_.

    As described before, `$namespace.using` requires a mandatory callback function known as **namespace scope**.  In fact, it can be given as first, second or any
    argument of $namespace.using - order is not important, but again, _providing it as the last argument will enforce readability!_ -:

        $namespace.using(function(mynamespace) { }, "mynamespace");
        $namespace.using("mynamespace", function(mynamespace, mynamespace2) {}, "mynamespace2");
        $namespace.using("mynamespace", "mynamespace2", function(mynamespace, mynamespace2) { });

    ### Nested namespaces

    Nested namespaces are possible and also recommended. Nesting namespaces allows a right segmentation of classes exposed by a software library.

    For example, next code listing would import/register a nested namespace:

        $namespace.using("mynamespace.nestedNamespace", function(nestedNamespace) {
    
        });

    It is about creating dot-separated paths. 

    When importing nested namespaces, classes from parent namespaces **are not imported**. An explicit *using* is required:

        $namespace.using("mynamespace", "mynamespace.nestedNamespace", function(mynamespace, nestedNamespace) {
    
        });

    ### Global namespace access

    Once a namespace has been used somewhere, it is also available using a global path, or in other words a namespace and its members can be accessed directly:

        $global.mynamespace.MyClass

    Sometimes this is useful: when some code requires a single class from some namespace and it is enough rather than creating a namespace scope.

    @class $namespace
*/

/**
    Imports the members of a set of given namespace paths. If some or all paths do no exist, they will get automatically registered.

    @method using
    @param paths {string} A comma-separated list of string literals, where each one is a namespace path.
    @param scopedFunc {Function} A function to create a namespace scope. It must have as many arguments as imported namespaces.
    @example
        $namespace.using("path1", "path1.ns1", function(path1, ns1) {
    
        });
*/