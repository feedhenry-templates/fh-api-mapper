
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
    },
    mocha_phantomjs: {
      all: {
        options: {
          urls: [
            'http://localhost:9001/test/frontend-tests.html'
          ]
        }
      }
    }
  });

  grunt.registerTask('serve-frontend-tests', 'Start a custom static web server.', function() {
    var expressHasStarted = this.async();
    grunt.log.writeln('Starting static web server in "." on port 9001.');
    var express = require('express');
    var app = express();
    app.engine('html', require('ejs').renderFile);
    app.get('/test/frontend-tests.html', function(req, res) {
      return res.render('../test/frontend-tests.html', {});
    });
    app.use(express['static'](__dirname));

    app.listen(9001, 'localhost', function() {
      console.log("Express started at: " + new Date() + " on port: " + 9001);
      expressHasStarted();
    });
  });

  grunt.loadNpmTasks('grunt-fh-build');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.registerTask('serve', ['bower', 'nodemon']);
  grunt.registerTask('test', ['jshint', 'fh:unit', 'test-frontend']);
  grunt.registerTask('default', ['bower', 'test']);
  grunt.registerTask('test-frontend', ['serve-frontend-tests', 'mocha_phantomjs']);
};
