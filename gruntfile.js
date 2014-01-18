module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'bin/<%= pkg.name %>.min.js'
      },
      options: {
        compress: {
          global_defs: {
            $userAgent_phantomjs: true
          }
        }
      }
    },
    copy: {
      main: {
        files: [
          {
            expand: true,
            flatten: true,
            src: ["bin/*"],
            dest: "doc/test"

          },
          {
            expand: true,
            flatten: true,
            src: ["test/*"],
            dest: "doc/test"
          },
          { 
            flatten: true,
            src: ['node_modules/grunt/**'], 
            dest: 'node_modules/joopl-analyzer/' 
          },
          { 
            flatten: true,
            src: ['node_modules/grunt-joopl-analyzer/**'], 
            dest: 'node_modules/joopl-analyzer/' 
          },
          { 
            flatten: true,
            src: ['node_modules/grunt-contrib-nodeunit/**'], 
            dest: 'node_modules/joopl-analyzer/' 
          }
        ]
      }
    },
    qunit: {
        all: ['./test/test.html'],
        options: {
            force: true,
            timeout: 20000
        }
    },
    run_grunt: {
        options: {
            minimumFiles: 1
        },
        simple_target: {
            src: ['node_modules/joopl-analyzer/gruntfile.js']
        }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: './src',
          themedir: './yuidoc/themes/default',
          outdir: './doc'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify'); 
  grunt.loadNpmTasks('grunt-contrib-copy');       
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks("grunt-run-grunt");
  grunt.loadNpmTasks('grunt-contrib-yuidoc');   

  grunt.registerTask('default', ['uglify', 'yuidoc', 'copy', 'qunit', 'run_grunt']);
  grunt.registerTask("doc-only", ["yuidoc", "copy"]);
}