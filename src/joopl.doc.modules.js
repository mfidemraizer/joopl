/**
    <h2 id="index">1.0 Index of contents</h2>

    - [2.0 Introduction to asynchronous dependency loading](#intro)
    - [3.0 What is a module in jOOPL?](#modules)
    - [4.0 Using `$import.mapMany`](#mapmany)
    - [5.0 Using `$import.modules` to asynchronously-loading JavaScript resources](#load-modules)

    <hr />

    <h2 id="intro">2.0 Introduction to asynchronous dependency loading</h2>

    jOOPL introduces asynchronous dependency loading thanks to the new `$import` object. That is, now jOOPL can load JavaScript files on the client-side.

    This is a great advantage, since jOOPL can load many JavaScript files in parallel using modern Web browsers improvements on resource loading.

    For those who are not familarized with asynchronous dependency loading, it means that JavaScript files are not imported using `<script>` elements in the
    HTML markup but they are loaded using AJAX under the hoods and parsed on the page asynchronously.

    Asynchronous dependency loading configuration and the resource loading itself is managed by the new `$import` object in the global JavaScript scope.

    While `$import` is absolutely decoupled from how JavaScript resources are loaded, current implementation internally relies on a small but powerful
    library called *HeadJS* (http://headjs.com) for this purpose.   

    **For that reason, HeadJS should be added with a `<script>` tag on the HTML page always before `$import.modules` statements are executed.**

    <h2 id="modules">3.0 What is a module in jOOPL?</h2>

    Most trending definition of JavaScript module is the *module pattern*:

        var module = {};

        (function(module) {
            module.SomeObject = function() {};

            module.SomeObject.prototype = {
                doSomething: function() {
                    // Do some stuff
                }
            };
        })(module);

    In the above sample, a global scope variable called `module` is the input parameter of a self-invoked function which adds an object prototype to the
    whole `module`. 

    This ensures that objects are encloused by the `module` and they are not added to the JavaScript global scope (in browsers, this is the `Window` object).

    In jOOPL, instead of implementing this concept of module, since it incorporates namespacing and classes or enumerations, there is no need for the regular
    *module pattern*: 

        $namespace.using("mynamespace.other", function(other) {
            // Classes are never declared in the global scope but 
            // as namespace object member! 
            other.declareClass("Boo");
        });

    Actually, the definition of module in jOOPL is just an identifier which represents a group of JavaScript resources/files:

    - **sampleModule** loads **fileA.js**, **fileB.js**, **fileN.js**...

    While loaded files by a module could be also non-jOOPL-based code files, it is expected to be JavaScript code developed using jOOPL and this means that
    as they will declare classes or enumerations inside namespaces, they will never introduce *garbage* in the global scope.

    <h2 id="mapmany">4.0 Using `$import.mapMany`</h2>
    
    In order to asynchronously load JavaScript resources, these should be configured before using the `$import.mapMany` function/method. 

    This function/method takes an object as parameter, where the object properties are module names and each property
    has an array of string, where these strings are absolute or relative paths to a JavaScript resource in order:

        $import.mapMany({
            // Some module called 'module1' depends on the following 3 files...
            "module1": [
                "/scripts/someFile.js",
                "/scripts/someOtherFile.js",
                "/scripts/yetAnotherFile.js"
            ],

            "module2": [
                "/scripts/oneFile.js",
                "/scripts/foo.js"
            ]
        });

    > **NOTE:** *Manually configuring JavaScript dependencies may be a waste of time when project has dozens or hundreds of JavaScript source code files. That is why*
    > *jOOPL project has introduced **jOOPL Analyzer**, a command-line tool capable of reading source code files in order to automatically generate a massive*
    > *`$import.mapMany` statement reflecting dependencies of all declared classes within a source code tree! [**Learn more here!!**](joopl-analyzer.html)*

    `$import.mapMany` statements must be executed before `$import.modules` (see next chapter).

    <h2 id="load-modules">5.0 Using `$import.modules` to asynchronously-loading JavaScript resources</h2>

    Once JavaScript resources are configured using `$import.mapMany` statements, these resources are loaded by using `$import.modules` statement.

    `$import.modules` function/method takes as arguments previously-configured module names and a callback function that will be called once JavaScript resources
    have been loaded and parsed on the Web browser:

        $import.modules("module1", "module2", function() {
            // Do stuff here when both modules are already loaded!
        }); 

    If HeadJS is not included in the Web page before `$import.modules` statements, then its callback is still executed but JavaScript modules will not be loaded.

    In the other hand, if everything worked as expected, for the time that callback is invoked, specified modules will be already loaded and accessible by callback's
    JavaScript code.



    @class $import
    
*/