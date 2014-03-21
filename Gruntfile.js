/*
 * grunt-devperf
 * https://github.com/gaelmetais/grunt-devperf
 *
 * Copyright (c) 2014 Gaël Métais
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    devperf: {
      options: {
        urls: [
          'http://www.francetvinfo.fr',
          'http://www.francetvsport.fr',
          'http://culturebox.francetvinfo.fr',
          'http://www.france3.fr/emissions/plus-belle-la-vie',
          'http://programme-tv.francetv.fr/',
          'http://alsace.france3.fr/',
          'http://pluzz.francetv.fr',
          'http://www.france2.fr',
          'http://www.france3.fr',
          'http://www.france4.fr',
          'http://www.france5.fr',
          'http://www.franceo.fr'
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'devperf', 'nodeunit']);

  grunt.registerTask('perf', ['devperf']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
