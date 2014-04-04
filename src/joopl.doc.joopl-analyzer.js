/**
    <h3 id="index">1.0 Index of contents</h3>

    - [2.0 Introduction](#introduction)
    - [3.0 How it works?](#how-it-works)
    - [4.0 System requirements](#requirements)
    - [5.0 Installing jOOPL Analyzer](#install)
    - [6.0 Configuring jOOPL Analyzer](#configuration)
    - [7.0 How to run jOOPL Analyzer](#run)
        - [7.1 Executing `joopl-analyzer` command](#execute)
    - [8.0 Rules that JavaScript code must follow to be analyzable by `joopl-analyzer`](#rules)
        - [Rule I: One `$import.modules` per source code file](#rule-import)
        - [Rule II: One `$namespace.using` per source code file](#rule-using)
        - [Rule III: One namespace member declaration (i.e. classes or enumerations) per source code file](#rule-one-nsmembers-per-file)
        - [Rule IV: Do not alias namespaces and their members (i.e. classes or enumerations)](#rule-no-aliases)
        - [Rule V: Object instantiation always with `new` operator](#rule-instantiation)
        - [Rule VI: Modules which load themself don't include the code file from which are loaded](#rule-module-load-itself)
    - [9.0 Using `moduleinfo.js` resulting file](#using-moduleinfo)
    - [10.0 Module including](#module-includes)
    - [11.0 Producing true modules](#modules)

    <hr />

    <h3 id="introduction">2.0 Introduction</h3>

    <a href="#index">Back to index of contents</a>

    jOOPL Analyzer is a command-line tool which comprehensively analyzes source code deeply looking for namespaces, classes and enumerations, and automatically
    creates a configuration that is used on run-time to load JavaScript file dependencies on the fly!

    For example, there are three source code files where each file defines a class A, B, C. Now C inherits B and B inherits A:

    **A.js**

        $namespace.using("test", function(test) {
            test.declareClass("A", {
    
            });
        });

    **B.js**

        $namespace.using("test", function(test) {
            test.declareClass("B", {
                inherits: test.A
            });
        });

    **C.js**

        $namespace.using("test", function(test) {
            test.declareClass("C", {
                inherits: test.B
            });
        });

    Running jOOPL Analyzer command-line tool will result in a file called `moduleinfo.js` containing this code listing:

        $import.mapMany({
            "test.A": ["A.js"],
            "test.B": ["A.js", "B.js"],
            "test.C": ["A.js", "B.js", "C.js"]
        });

    Note how jOOPL analyzer detects that class inheritance requires the file containing the base class declaration - *hopefully it is smart enough!* -.
    
    This is just a simple sample of jOOPL Analyzer dependency detection!

    <hr />

    <h3 id="how-it-works">3.0 How it works?</h3>

    <a href="#index">Back to index of contents</a>

    JavaScript files must be located in some diretory, but they can be distributed in subdirectories without a nesting limit. 

    jOOPL Analyzer is executed in the base directory where JavaScript files are located (i.e., usually Web sites have a `/scripts` directory) and looks for
    namespaces, classes, enumerations and class instances across all files and identifies their physical dependencies. Once detection has ended, jOOPL Analyzer
    creates a file called `moduleinfo.js` on the root of given base directory which will contain the whole phsyical file dependency configuration.

    <hr />

    <h3 id="requirements">4.0 System requirements</h3>

    <a href="#index">Back to index of contents</a>

    jOOPL Analyzer is a NodeJS-based command-line tool. These are the minimum system requirements in order to work with jOOPL Analyzer:

    - NodeJS-compatible operating system (Windows, Mac, Linux...). Look for compatibiliy on <a href="http://nodejs.org">NodeJS official site</a>.
    - JavaScript code written using at least jOOPL 2.5.

    <hr />

    <h3 id="install">5.0 Installing jOOPL Analyzer</h3>

    <a href="#index">Back to index of contents</a>

    Once NodeJS was installed in your operating system, next step is **globally** installing jOOPL Analyzer using NodeJS Package Manager (NPM):

        npm install -g joopl-analyzer

    Now jOOPL Analyzer will be installed in your local system.

    <hr />

    <h3 id="run">6.0 How to run jOOPL Analyzer</h3>

    <a href="#index">Back to index of contents</a>

    As jOOPL Analyzer package using NPM must be installed globally (NPM `-g` command-line argument), there is a `joopl-analyzer` command available
    from the operating system shell (bash, Windows command prompt CMD, Windows Powershell...).

    Once `joopl-analyzer -h` or `joopl-analyzer --help` is executed, it writes down on the shell output the following documentation with basic details
    about how to work with `joopl-analyzer` command-line interface:

          Usage: cli.js [options]

              Options:

                -h, --help                  output usage information

                -V, --version               output the version number

                -d, --directory <basedir>   Specifies the base directory from which the analyzer must start 
                                            the search of JavaScript dependencies

                -e, --excludes <excludes>   A semicolon-separated list of directories to exclude from the analysis 
                                            (f.e. ./js/jquery;./js/other)

                -i, --includes <includes>   A semicolon-separated list of other moduleinfo.js files (either from local file
                                            system or http:// or https://) that must be included to let analysis reference
                                            their files in the analysis 

                                            For example: http://mysite.com/js/moduleinfo.js;./otherproject/js/moduleinfo.js
                
                -b, --baseDirectoryOverrides <baseDirectoryOverrides> 

                                            A semicolon-separated list of key-value pairs, where key is a base directory and
                                            value is the replace with expression.

                                            This allows analysis to replace base directories to an arbitrary base directory in
                                            the resulting analysis.

                                            For example, if given base directory is ./web/js, resulting moduleinfo.js will 
                                            have paths like ./web/js/myclass.js. But maybe the HTML page which hosts the 
                                            JavaScript files require JavaScript files to be loaded from ./js. 

                                            Then, this parameter should provide a list like this: 
                                                -b ./web/js=./js/$2

                -q, --quiet                 Quiet mode: no console output

                -n, --nologo                Hides jOOPL logo


    <h4 id="execute">7.1 Executing `joopl-analyzer` command</h4>

    <a href="#index">Back to index of contents</a>

    `joopl-analyzer` command is executed against a base directory from which the analyzer will do the whole code analysis. This base directory can be 
    inferred from current shell working directory or by providing the `-d` / `--directory` argument. For example:

        joopl-analyzer
        joopl-analyzer -d ./scripts
        joopl-analyzer -d C:\myproject\scripts
        joopl-analyzer -d /home/myproject/scripts
        joopl-analyzer --directory ./scripts
        joopl-analyzer --directory C:\myproject\scripts
        joopl-analyzer --directory /home/myproject/scripts

    When `joopl-analyzer` command execution finishes it creates a file called `moduleinfo.js` in the given base directory.
    
    <h3 id="rules">8.0  Rules that JavaScript code must follow to be analyzable by `joopl-analyzer`</h3>

    <a href="#index">Back to index of contents</a>

    jOOPL-based JavaScript code should follow some rules in order to allow `joopl-analyzer` command to work as expected.
 
    Otherwise, any code that does not follow the next rules will be still analyzed but with no result in terms of file dependency
    detection. *Free-style JavaScript code is still possible*.
    
    <h4 id="rule-import">Rule I: One `$import.modules` per source code file</h4>
    
    <a href="#index">Back to index of contents</a>

    Never use more than one `$import.modules` statement per source code file.

    **SomeFile.js**
        
        // One $import.modules per code file. Callback function sorrounds the code
        // that will be executed and which depends on loaded modules
        $import.modules("module1", "module2", function() {
            // Do stuff here
        });
    
    <h4 id="rule-using">Rule II: One `$namespace.using` per source code file</h4>
    
    <a href="#index">Back to index of contents</a>

    Never use more than one `$namespace.using` statement in the same source code file: just import all namespaces using a single 
    statement:

    **SomeFile.js**

        $namespace.using("myapp.ns1", "myapp.ns2", function(ns1, ns2) {
            // More code here, but never another $namespace.using!!!
        });

    <h4 id="rule-one-nsmember-per-file">Rule III: One namespace member declaration (i.e. classes or enumerations) per source code file</h4>
    
    <a href="#index">Back to index of contents</a>

    Never declare more than a class or enumeration in the same source code file.

    <h4 id="rule-no-aliases">Rule IV: Do not alias namespaces and their members (i.e. classes or enumerations)</h4>
    
    <a href="#index">Back to index of contents</a>

    Never alias namespaces and their members like classes or enumerations:

    **SomeFile.js**

        $namespace.using("myapp.ns1", "myapp.ns2", function(ns1, ns2) {
            // NOOOOOOO!!!!
            var nsAlias = ns2;

            // This would store ns1.A class constructor on a variable so it can be called 
            // as the next sentence to this variable declaration/initialization...
            var A = ns1.A;

            var instance = new A();
             // OK, this would work on run-time, but joopl-analyzer will not be able to cover
             // this use case. ALWAYS INSTANTIATE CLASSES FROM THEIR ORIGINAL NAMESPACE!!

            var instance2 = new ns1.A(); // This is fine for joopl-analyzer!
        });
    
    <h4 id="rule-instantiation">Rule V: Object instantiation always with `new` operator</h4>
    
    <a href="#index">Back to index of contents</a>

    Never instantiate objects using `Object.create` or any other approach. Always use `new` operator.

    <h4 id="rule-module-load-itself">Rule VI: Modules which load themself don't include the code file from which are loaded</h4>
    
    <a href="#index">Back to index of contents</a>

    See the following sample

        // SomeClass.js

        $import.modules("joopl.test.MyClass", function() {
            $namespace.using("joopl.test", function(test) {
                test.declareClass("SomeClass");
            });
        });

    Once `joopl-analyzer` gets executed, resulting `moduleinfo.js` file would contain - along with other detected classes and enumerations - 
    the following code:

        // moduleinfo.js

        $import.mapyMany({
            // ... other detected members

            "joopl.test.MyClass": [] // It's empty!!
        });

    When a code file imports itself as a module, it's skipped. This rule works as expected and it is extremely important because it prevents
    the whole code file from being loaded twice!

    <hr />

    <h3 id="using-moduleinfo">10.0 Using `moduleinfo.js` resulting file</h3>
    
    <a href="#index">Back to index of contents</a>
    
    As explained in previous chapters, running `joopl-analyzer` command produces a file called `moduleinfo.js`. Also, as explained in 
    [*Asynchronous dependency loading documentation*]($import.html), `moduleinfo.js` file
    must be added on some HTML page just after jOOPL `<script>` tag. That is, detected JavaScript dependencies and their relations will be
    configured before `$import.modules` statements are executed.

    <hr />

    <h3 id="module-includes">10.0   Module including - A very powerful feature!</h3>

    There is a first project which produces a `moduleinfo.js` hosted in a place A. And later, there is a second project which
    is hosted in place B.

    The whole second project requires classes from the first project.

    This requirement is covered by *module including* feature.

    When includes are provided to the analyzer, and it is executed against second project, it will only analyze its own 
    code files but it will also include already produced dependencies from the first project's `moduleinfo.js` file.

    For example, if first project has a class `A` and second project a class `B` which inherits `A`, if first project's
    `moduleinfo.js` file is included during second project's analysis, the resulting `moduleinfo.js` will contain something like:

        $import.mapMany({
            "project1.A": [
                "http://myproject1.com/js/classA.js"
            ],

            // 2nd project's B class has also detected that inherits from A!!!!!!!!!!!!!
            "project2.B": [
                "http://myproject1.com/js/classA.js",
                "http://myproject2.com/js/classB.js"
            ]
        });

    This is possible thanks to the `-i` or `--includes` command-line parameter:

        joopl-analyzer -d ./js -i http://myproject1.com/js/moduleinfo.js

    <h3 id="modules">11.0 Producing true modules with `joopl-analyzer`!</h3>
    
    <a href="#index">Back to index of contents</a>

    jOOPL Analyzer, as explained in previous chapters, looks for class/enumeration declarations and instantiations across a source code tree. 

    If all files are just class and enumeration declarations, `moduleinfo.js` produced file will contain which files are required by each declared
    member.

    But what if instead of producing modules as classes `joopl-analyzer` should produce true modules grouping the required files to load a set of
    classes or even a full namespace? No problem since it is about creating a file which instantiates all namespace classes inside a *placeholder class*
    and `joopl-analyzer` will be smart enough to detect a module which will load more than a class!

    See the following sample code:
        
        // A.js
        $namespace.using("joopl.test", function(test) {
            this.declareClass("A", {});
        });

        // B.js
        $namespace.using("joopl.test", function(test) {
            this.declareClass("B", {
                inherits: test.A
            });
        });

        // C.js
        $namespace.using("joopl.test", function(test) {
            this.declareClass("C", {
                inherits: test.B
            });
        });

        // SomeOtherClass.js
        $namespace.using("joopl.test", function(test) {
            this.declareClass("SomeOtherClass", {});
        });

        // TestClasses.js
        // Now we create a module called "TestClasses" using a "placeholder class".
        // The whole class has a constructor that instantiates all classes from the namespace...

        $import.modules("joopl.test.TestClasses", function() {
            $namespace.using("joopl.test", function(test) {
                this.declareClass("TestClasses", {
                    ctor: function() {
                        new test.A();
                        new test.B();
                        new test.C();
                        new test.SomeOtherClass();
                    }
                });
            });
        });

    After executing `joopl-analyzer` for this hypothetical source code tree, `moduleinfo.js` file will contain a module called
    **"joopl.test.testClasses"** containing JavaScript code files of the instantiated classes within the placeholder class constructor:

        $import.mapMany({
            "joopl.test.TestClasses": [
                "A.js",
                "B.js",
                "C.js",
                "SomeOtherClass.js",
                "testClasses.js"
            ]
        });

    Note that the code file defining which classes or enumerations will contain the whole module *TestClasses* is not included in the 
    `moduleinfo.js` file. [This is because of the **Rule VI: Modules which load themself don't include the code file from which are loaded**](#rule-module-load-itself). This
    is extremely useful because import/load the whole module using `$import.modules` will not load the placeholder class but just only the classes 
    group by the module itself!

    Great! **joopl.test.testClasses** module can be used to load 5 classes in order with less code:

        // First of all, load the whole module
        $import.modules("joopl.test.testClasses", function() {
            $namespace.using("joopl.test", function(test) {
                // Now joopl.test namespace will be correctly loaded
                // and A, B, C and SomeOtherClass classes will be available!
                var a = new test.A(); // This will work!
                var a = new test.B(); // This will work!
                var a = new test.C(); // This will work!
                var a = new test.SomeOtherClass(); // This will work!
            });
        });

    An important detail is above code instantiates classes in order (A, B, C...). This is not mandatory, since `joopl-analyzer` detects code file
    loading order:

        $import.modules("joopl.test.testClasses", function() {
            $namespace.using("joopl.test", function(test) {
                // Instantiation order has been altered, but code files will be detected
                // in the same order as previous sample!
                var a = new test.SomeOtherClass(); // This will work!
                var a = new test.C(); // This will work!
                var a = new test.A(); // This will work!
                var a = new test.B(); // This will work!
            });
        });



    @class joopl-analyzer
*/