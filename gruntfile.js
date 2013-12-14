module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: '<%= pkg.name %>.js',
        dest: 'bin/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
        all: ['./test/test.html'],
        options: {
            force: true,
            timeout: 20000
        }
    },
    nodeunit: {
      all: ["./node_modules/joopl-analyzer/test/test.js"]
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: '.',
          themedir: './yuidoc/themes/default',
          outdir: './doc'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');      
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-nodeunit'); 
  grunt.loadNpmTasks('grunt-contrib-yuidoc');   

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'qunit', 'nodeunit', 'yuidoc']);
};