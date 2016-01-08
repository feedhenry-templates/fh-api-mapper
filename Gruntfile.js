
module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['application.js', 'lib/**/*.js', 'test/**/*.js', 'public/js/*.js']
    },
    unit: ['mocha -A -u exports --recursive -t 10000 ./test/unit'],
    browserify : {
      client : {
        src : 'public/js/app.js',
        dest : 'public/js/app-built.js',
        options : {
          watch : true
        }
      }
    },
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
    mocha_phantomjs: {
      all: {
        options: {
          urls: [
            'http://localhost:9001/test/frontend-tests.html'
          ]
        }
      }
    },
    copy: {
      main: {
        files:[
          {
            cwd : 'node_modules/font-awesome',
            expand: true,
            flatten: false,
            src: '{less,fonts}/**',
            dest: 'public/lib/font-awesome/'
          },
          {
            cwd : 'node_modules/bootstrap',
            expand: true,
            flatten: false,
            src: '{js,less,fonts}/**',
            dest: 'public/lib/bootstrap/'
          },
          {
            cwd : 'node_modules/bootstrap-treeview/dist',
            expand: true,
            flatten: false,
            src: '**/*.{js,css,less}',
            dest: 'public/lib/bootstrap-treeview/'
          },
          {
            cwd : 'node_modules/patternfly',
            expand: true,
            flatten: false,
            src: '{less,components,fonts,dist}/**',
            dest: 'public/lib/patternfly/'
          },
          {
            cwd : 'node_modules/brace',
            expand: true,
            flatten: false,
            src: '**/*',
            dest: 'public/lib/brace/'
          }
        ]
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
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-browserify');
  
  grunt.registerTask('serve', ['copy', 'browserify:client', 'nodemon']);
  grunt.registerTask('test', ['jshint', 'fh:unit']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('test-frontend', ['serve-frontend-tests', 'mocha_phantomjs']);
};
