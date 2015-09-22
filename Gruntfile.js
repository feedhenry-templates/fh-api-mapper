module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['application.js', 'lib/**/*.js', 'test/**/*.js', 'public/js/*.js']
    },
    unit: ['mocha -A -u exports --recursive -t 10000 ./test/unit'],
    nodemon: {
      dev: {
        script: 'application.js',
        options: {
          ignore: ['public/**', 'public/lib/**', 'node_modules'],
          ext: 'js,html',
          env: {
            FH_PORT: 8001,
            FH_MONGODB_CONN_URL : 'localhost:27017'
          }
        }
      }
    },
    bower: {
      install: {
        //just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
        options: {
          targetDir: './public/lib/',
          layout: 'byComponent'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-fh-build');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.registerTask('serve', ['bower', 'nodemon']);
  grunt.registerTask('test', ['jshint', 'fh:unit']);
  grunt.registerTask('default', ['bower', 'test']);
};
