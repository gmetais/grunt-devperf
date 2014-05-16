module.exports = function(grunt) {

  grunt.initConfig({
    devperf: {
      options: {
        urls: [
          // Insert the URLs you want to test in this list
          'http://www.my-website.com/my-page-1',
          'http://www.my-website.com/my-page-2'
        ],
        openResults: true,
        timeout: 300,
        numberOfRuns: 5,
        resultsFolder: './'
      }
    }
  });

  grunt.loadNpmTasks('grunt-devperf');
  grunt.registerTask('default', ['devperf']);
};