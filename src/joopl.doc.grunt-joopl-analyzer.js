/**
<h2>Installation</h2>

jOOPL Analyzer's `joopl-analyzer` command may be integrated on a *GruntJS* build using the `grunt-joopl-analyzer` task.

The whole task is distributed as a NodeJS Package Manager (NPM) module and it can be installed using the following regular approach:

    npm install grunt-joopl-analyzer

This should both install the whole task and `joopl-analyzer` dependencies in your local development directory.

<h2>Configuring `Gruntfile.js`</h2>

In order to integrate `joopl-analyzer` task in your own `Gruntfile.js` and  be able to run it, `grunt-joopl-analyzer` should be imported and configured this way:

    module.exports = function(grunt) {
      grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // joopl-analyzer specific settings
        jooplanalyzer: {
            all: {
                options: {
                    baseDirectory: "./js", // The relative of absolute directory path from which to start the analysis
                    quiet: false, // Reduces console output just by showing errors and minimal warnings

                    // Defines an array of relative or absolute directory paths to exclude from the analysis
                    fileExcludes: [
                        "./js/jquery",
                        "./js/knockout"
                    ]
                }
            }
      });

      grunt.loadNpmTasks("grunt-joopl-analyzer");

      // Default task(s).
      grunt.registerTask('default', ['jooplanalyzer']);
    };

<h3>Available settings</h3>
`jooplanalyzer` task supports the following settings:

- `baseDirectory`. Configures the absolute or relative base directory from which the analyzer should start looking for code files.
- `quiet`. Defaults to `false`. If `true`, it will reduce console output just by showing errors and minimal warnings.
- `fileExcludes`. Defines an array of relative of absolute directory paths to exclude from the analysis.
- `baseDirectoryOverrides`. Described bellow.

<h4>`baseDirectoryOverrides` task setting</h4>

This settings defines rules to replace a part of the resulting detected files during the analysis with other string.

For example, if given base directory is `./web/js` but once `moduleinfo.js` file is included in some page requires that the relative
base directory should be just `./js`, sample task settings should look like this:

    module.exports = function(grunt) {
      grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // joopl-analyzer specific settings
        jooplanalyzer: {
            all: {
                options: {
                    baseDirectory: "./js", // The relative of absolute directory path from which to start the analysis
                    quiet: false, // Reduces console output just by showing errors and minimal warnings

                    // Defines an array of relative or absolute directory paths to exclude from the analysis
                    fileExcludes: [
                        "./js/jquery",
                        "./js/knockout"
                    ],

                    baseDirectoryOverrides: {
                      // "$2" is the non-replaced part that will be concatenated to the new base directory
                      { startsWith: "./web/js", replaceWith: "./js/$2" }
                    }
                }
            }
      });

      grunt.loadNpmTasks("grunt-joopl-analyzer");

      // Default task(s).
      grunt.registerTask('default', ['jooplanalyzer']);
    };

One of most practical use cases of `baseDirectoryOverrides` is overriding base directory to convert it to a URI:

    .....
    baseDirectoryOverrides: {
      { startsWith: "./web/js", replaceWith: "http://www.mysite.com/js/$2" }
    }


This will hold the execution as expected and any change in the base directory and any of its own sub-directories will trigger `jooplanalyzer` GruntJS task.

    @class grunt-joopl-analyzer
*/