module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['application.js', 'lib/**/*.js', 'test/**/*.js'/*, 'public/js/*.js'*/]
    },
    unit: ['mocha -A -u exports --recursive -t 10000 ./test/unit'],
    nodemon: {
      dev: {
        script: 'application.js',
        options: {
          ignore: ['public/**'],
          ext: 'js,html',
          env: {
            FH_PORT: 8001,
            FH_MONGODB_CONN_URL : 'localhost:27017'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-fh-build');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.registerTask('serve', ['nodemon']);
  grunt.registerTask('test', ['jshint', 'fh:unit']);
  grunt.registerTask('default', 'test');
};
