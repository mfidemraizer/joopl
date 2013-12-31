/**
<h2>Installation</h2>

jOOPL Analyzer's `joopl-analyzer` command may be integrated on a *GruntJS* build using the `grunt-joopl-analyzer` task.

The whole task is distributed as a NodeJS Package Manager (NPM) module and it can be installed using the following regular approach:

    npm install joopl-analyzer
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
            baseDirectory: "./scripts",
            watch: grunt.option("watch") || false
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
- `watch` (true/false). Holds the build open indefinitely and, after any change within the given base directory, automatically re-analyzes it.

<h4>About `watch` setting</h4>
As shown in configuration sample, `watch` is `false` by default until option `watch` is given when running GruntJS from the command-line. In order to 
activate `watch`, just run GruntJS as follows:

    grunt jooplanalyzer --watch=true

This will hold the execution as expected and any change in the base directory and any of its own sub-directories will trigger `jooplanalyzer` GruntJS task.

    @class grunt-joopl-analyzer
*/