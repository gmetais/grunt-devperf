/*
 * grunt-devperf
 * https://github.com/gaelmetais/grunt-devperf
 *
 * Copyright (c) 2014 Gaël Métais
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/devperf.js',
        'tasks/front/assets/main.js'
      ]
    },

    // Configuration to be run
    devperf: {
      options: {
        urls: [
          'http://www.google.com',
          'http://www.yahoo.com'
        ],
        openResults: true
      }
    },

    // Unit tests : TODO
    nodeunit: {
      tests: []
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');


  grunt.registerTask('default', ['devperf']);

  // By default, lint and run all tests.
  grunt.registerTask('lint', ['jshint']);

};
