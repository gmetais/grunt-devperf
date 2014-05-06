module.exports = function(grunt) {

  grunt.initConfig({
    devperf: {
      options: {
        urls: [
          // Insert the URLs you want to test in this list
          'http://www.my-website.com/my-page'
        ]
      },
      openResults: true,
      timeout: 300,
      numberOfRuns: 7
    }
  });

  grunt.loadNpmTasks('grunt-devperf');
  grunt.registerTask('default', ['devperf']);
};