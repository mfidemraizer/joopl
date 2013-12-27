/**
    <h3 id="index">1.0 Index of contents</h3>

    - [2.0 Introduction](#introduction)
    - [3.0 How it works?](#how-it-works)
    - [4.0 System requirements](#requirements)
    - [5.0 Installing jOOPL Analyzer](#install)
    - [6.0 Configuring jOOPL Analyzer](#configuration)
    - [7.0 How to run jOOPL Analyzer](#run)
        - [7.1 Executing `joopl-analyzer` command](#execute)
    - [8.0  Rules that JavaScript code must follow to be analyzable by `joopl-analyzer`](#rules)
        - [Rule I: One `$import.modules` per source code file](#rule-import)
        - [Rule II: One `$namespace.using` per source code file](#rule-using)
        - [Rule III: One namespace member declaration (i.e. classes or enumerations) per source code file](#rule-one-nsmembers-per-file)
        - [Rule IV: Do not alias namespaces and their members (i.e. classes or enumerations)](#rule-no-aliases)
        - [Rule V: Object instantiation always with `new` operator](#rule-instantiation)

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

    <h3 id="how-it-works">3.0 How it works?</h3>
    <a href="#index">Back to index of contents</a>

    JavaScript files must be located in some diretory, but they can be distributed in subdirectories without a nesting limit. 

    jOOPL Analyzer is executed in the base directory where JavaScript files are located (i.e., usually Web sites have a `/scripts` directory) and looks for
    namespaces, classes, enumerations and class instances across all files and identifies their physical dependencies. Once detection has ended, jOOPL Analyzer
    creates a file called `moduleinfo.js` on the root of given base directory which will contain the whole phsyical file dependency configuration.

    <h3 id="requirements">4.0 System requirements</h3>
    <a href="#index">Back to index of contents</a>

    jOOPL Analyzer is a NodeJS-based command-line tool. These are the minimum system requirements in order to work with jOOPL Analyzer:

    - NodeJS-compatible operating system (Windows, Mac, Linux...). Look for compatibiliy on <a href="http://nodejs.org">NodeJS official site</a>.
    - JavaScript code written using at least jOOPL 2.5.

    <h3 id="install">5.0 Installing jOOPL Analyzer</h3>
    <a href="#index">Back to index of contents</a>

    Once NodeJS was installed in your operating system, next step is **globally** installing jOOPL Analyzer using NodeJS Package Manager (NPM):

        npm install -g joopl-analyzer

    Now jOOPL Analyzer will be installed in your local system.

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

    <h3 id="rules">8.0  Rules that JavaScript code must follow to be analyzable by `joopl-analyzer`</h3>
    <a href="#index">Back to index of contents</a>

    jOOPL-based JavaScript code should follow some rules in order to allow `joopl-analyzer` command to work as expected.
 
    Otherwise, any code that does not follow the next rules will be still analyzed but with no result in terms of file dependency
    detection. *Free-style JavaScript code is still possible*.
    
    <h4 id="rule-import">Rule I: One `$import.modules` per source code file</h4>

    Never use more than one `$import.modules` statement per source code file.

    **SomeFile.js**
        
        // One $import.modules per code file. Callback function sorrounds the code
        // that will be executed and which depends on loaded modules
        $import.modules("module1", "module2", function() {
            // Do stuff here
        });
    
    <h4 id="rule-using">Rule II: One `$namespace.using` per source code file</h4>

    Never use more than one `$namespace.using` statement in the same source code file: just import all namespaces using a single 
    statement:

    **SomeFile.js**

        $namespace.using("myapp.ns1", "myapp.ns2", function(ns1, ns2) {
            // More code here, but never another $namespace.using!!!
        });

    <h4 id="rule-one-nsmember-per-file">Rule III: One namespace member declaration (i.e. classes or enumerations) per source code file</h4>

    Never declare more than a class or enumeration in the same source code file.

    <h4 id="rule-no-aliases">Rule IV: Do not alias namespaces and their members (i.e. classes or enumerations)</h4>

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

    Never instantiate objects using `Object.create` or any other approach. Always use `new` operator.


    @class joopl-analyzer
*/