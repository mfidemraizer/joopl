/**
    <h3 id="index">1.0 Index of contents</h3>

    - [2.0 Introduction](#introduction)
    - [3.0 How it works?](#how-it-works)
    - [4.0 System requirements](#requirements)
    - [5.0 Installing jOOPL Analyzer](#install)
    - [6.0 Configuring jOOPL Analyzer](#configuration)
    - [7.0 How to run jOOPL Analyzer](#run)
        - [7.1 Executing `joopl-analyzer` command](#execute)
    - [8.0 How to use `joopl-analyzer`](#how-to-use)
    - [9.0 Rules that JavaScript code must follow to be analyzable by `joopl-analyzer`](#rules)
        - [Rule I: One `$import.modules` per source code file](#rule-import)
        - [Rule II: One `$namespace.using` per source code file](#rule-using)
        - [Rule III: One namespace member declaration (i.e. classes or enumerations) per source code file](#rule-one-nsmembers-per-file)
        - [Rule IV: Do not alias namespaces and their members (i.e. classes or enumerations)](#rule-no-aliases)
        - [Rule V: Object instantiation always with `new` operator](#rule-instantiation)
        - [Rule VI: Modules which load themself don't include the code file from which are loaded](#rule-module-load-itself)
    - [10.0 Using `moduleinfo.js` resulting file](#using-moduleinfo)
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

    <h3 id="configuration">6.0 Configuring jOOPL Analyzer</h3>

    <a href="#index">Back to index of contents</a>

    Command-line tool accepts configuration but there is no global configuration. Instead of a global configuration, there is an optional `joopl-analyzer.json` JSON
    configuration file that should be located in the base directory where the analyzer should start dependency detection.

    #### 6.1 Configuration scheme

    <a href="#index">Back to index of contents</a>

    The JSON configuration must be contained in a file called **joopl-analyzer.json** in the root directory of JavaScript files.

    The whole file has the following configuration parameters:

    - **fileExcludes**. It is an array of strings where each string is either a relative path to a file or directory that should be excluded from the analyzing process.
    - **baseDirectoryOverrides**. Overrides base directory in the resulting **moduleinfo.js** file after JavaScript source code analysis. It is an array of objects, where each object has two properties
    > - *startsWith*, which defines the directory to override (for example, "./scripts")
    > - *replaceWith*, which defines the directory to replace from the source one.

    ##### 6.1.1 About "baseDirectoryOverrides" configuration parameter

    <a href="#index">Back to index of contents</a>

    This parameter - *baseDirectoryOverrides* - is the ideal approach to change a local path to production one, even to a full HTTP URI:

        {
            "baseDirectoryOverrides": [
                "startsWith": "./scripts",
                "replaceWith": "http://cdn.mywebsite.com/scripts"
            ]
        }

    ##### 6.1.2 Full configuration sample

    <a href="#index">Back to index of contents</a>

    **joopl-analyzer.json**

        {
    
            "baseDirectoryOverrides": [
                { 
                    "startsWith": "./scripts/foo", 
                    "replaceWith": "./scripts/boo" 
                },
                { 
                    "startsWith": "./scripts/libs", 
                    "replaceWith": "http://cdn.mysite.com/scripts/libs" 
                }
            ],

            "fileExcludes": [
                "./scripts/jquery",
                "./knockout.min.js"
            ]
        }

    <hr />

    <h3 id="run">7.0 How to run jOOPL Analyzer</h3>

    <a href="#index">Back to index of contents</a>

    As jOOPL Analyzer package using NPM must be installed globally (NPM `-g` command-line argument), there is a `joopl-analyzer` command available
    from the operating system shell (bash, Windows command prompt CMD, Windows Powershell...).

    Once `joopl-analyzer -h` or `joopl-analyzer --help` is executed, it writes down on the shell output the following documentation with basic details
    about how to work with `joopl-analyzer` command-line interface:

          Usage: cli.js [options]

              Options:

                -h, --help                 output usage information
                -V, --version              output the version number
                -w, --watch                Holds this CLI open and executes the analyzer whenever some file changes within the given base directory
                -d, --directory <basedir>  Specifies the base directory from which the analyzer must start the search of JavaScript dependencies
                -q, --quiet                Quiet mode: no console output
                -n, --nologo               Hides jOOPL logo


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

    <h3 id="how-to-use">8.0 How to use `joopl-analyzer`</h3>

    Apart of its command-line arguments and other details, there is an important point and it is *how to use it in real-world projects*.

    Since jOOPL is a library to build object-oriented frameworks, some project may require to load code files belonging to other one. 

    For example, there is a Web application which needs to use a framework - which is a second project developed alone -. Even the Web application
    might require 3 or 4 different framework projects.

    In the above sample, `joopl-analyzer` should not run for each of the projects but for the Web application only.

    The so-called Web application should have a copy of the whole frameworks and, if the Web Application requires some class found in some of 
    copied frameworks, as everything is within the same directory tree, `joopl-analyzer` will detect dependencies as expected.

    A sample Web Application would have a `Libs` directory where other frameworks required by the whole Web Application may reside in. 
    
        Web application
        └───Libs
            ├───Framework A
            ├───Framework B
            └───Framework C

    When using JavaScript package managers like NodeJS Package Manager or Bower (or similar projects), that sample `Libs` directory would be 
    the standard `node_modules` directory, since third-party projects or just dependencies are downloaded in a dedicated directory as child of
    the application directory.

    The whole point is that, when using `joopl-analyzer`, dependency detection must be done against a full source tree and any dependency must be within
    that *source tree*.

    <h3 id="rules">9.0  Rules that JavaScript code must follow to be analyzable by `joopl-analyzer`</h3>

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