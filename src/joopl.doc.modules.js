/**
    ## jOOPL Analyzer

    <hr />

    <h3 id="index">1.0 Index of contents</h3>

    - [2.0 Introduction](#introduction)
    - [3.0 How it works?](#how-it-works)
    - [4.0 System requirements](#requirements)
    - [5.0 Installing jOOPL Analyzer](#install)
    - [6.0 Configuring jOOPL Analyzer](#configuration)

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

    Running jOOPL Analyzer command-line tool will result in a file containing this code listing:

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

    @class joopl-analyzer
*/