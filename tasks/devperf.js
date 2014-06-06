/*
 * grunt-devperf
 * https://github.com/gaelmetais/grunt-devperf
 *
 * Copyright (c) 2014 Gaël Métais
 * Licensed under the MIT license.
 */

/*jslint node: true */
'use strict';

module.exports = function(grunt) {
  require('grunt-phantomas/tasks/phantomas')(grunt);

  grunt.registerTask('devperfAfter', 'Task to run after phantomas', function() {
    
    grunt.task.requires('phantomas');

    var options = this.options({});
    var devperfProcessor = require('./lib/devperfProcessor')(options);

    // Read and process the data from the phantomas JSON files
    var pages = [];
    options.urls.forEach(function(url) {
      grunt.log.writeln('Processing data for ' + url);
      pages.push(devperfProcessor.processData(url, sanitizeFolderName(url)));
    });

    // Copy assets
    var frontFilesPath = __dirname + '/front';
    var assets = ['main.js', 'main.css', 'interlace.png', 'handlebars-v1.3.0.js', 'jquery-2.1.0.min.js', 'highcharts.js'];
    assets.forEach(function(assetName) {
      grunt.file.copy(frontFilesPath + '/assets/' + assetName, options.resultsFolder + '/assets/' + assetName);
    });

    // Write result file
    var resultsFilePath = options.resultsFolder + '/results.json';
    var resultsJSON = JSON.stringify({pages: pages}, null, 4);
    grunt.file.write(resultsFilePath, resultsJSON);

    // Write settings file for the front
    var settingsFilePath = options.resultsFolder + '/settings.json';
    var settingsJSON = JSON.stringify(options, null, 4);
    grunt.file.write(settingsFilePath, settingsJSON);

    // Write index.html
    var indexPath = options.resultsFolder + '/index.html';
    var indexHtml = grunt.file.read(frontFilesPath + '/index.html');
    indexHtml = indexHtml.replace('/*%%RESULTS%%*/', 'var results = ' + resultsJSON);
    indexHtml = indexHtml.replace('/*%%SETTINGS%%*/', 'var settings = ' + settingsJSON);
    grunt.file.write(indexPath, indexHtml);
    grunt.log.writeln('File "' + indexPath + '" created.');

    // Open the index.html file in browser (option)
    if (options.openResults) {
      require('grunt-open/tasks/open')(grunt);
      
      // Inject the config into devperfAfter task
      grunt.config.set('open.devperf_auto_task', {path: indexPath});
      grunt.task.run('open:devperf_auto_task');
    }
  });


  // Executes the sequence (phantomas, then devperf)
  grunt.registerTask('devperf', 'Helps front-end developers to maintain a good quality, based on phantomas and grunt-phantomas.', function() {

    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      urls: [
        'http://www.google.fr'
      ],
      warnings: [],
      numberOfRuns: 5,
      timeout: 120,
      openResults: false,
      resultsFolder: './devperf'
    });

    var defaultWarnings = grunt.file.readJSON(__dirname + '/settings/desktop.json');

    // Merge user defined warnings with defaults
    defaultWarnings.forEach(function(defaultWarn) {
      var found = false;
      options.warnings.forEach(function(userWarn) {
        if (userWarn.variable === defaultWarn.variable) {
          found = true;
          if (userWarn.message === undefined) {
            userWarn.message = defaultWarn.message;
          } else if (userWarn.limit === undefined) {
            userWarn.limit = defaultWarn.limit;
          } else if (userWarn.message === undefined && userWarn.limit === undefined) {
            grunt.log.error('Warning ' + userWarn.variable + ' is misconfigured, it has been ignored.');
            userWarn.limit = -1;
            userWarn.message = "Ignored";
          }
        }
      });
      if (!found) {
        options.warnings.push(defaultWarn);
      }
    });

    // Inject the phantomas config into grunt config
    var phantomasConfig = {};
    options.urls.forEach(function(url) {
      phantomasConfig[sanitizeFolderName(url)] = {
        options: {
          indexPath: options.resultsFolder + '/' + sanitizeFolderName(url) + '/',
          url: url,
          numberOfRuns: options.numberOfRuns,
          options: {
            timeout: options.timeout
          }
        }
      };
    });
    grunt.config.set('phantomas', phantomasConfig);
    grunt.task.run('phantomas');

    // Inject the config into devperfAfter task
    grunt.config.set('devperfAfter', {options: options});
    grunt.task.run('devperfAfter');
  });
};

function sanitizeFolderName(path) {
  var folderName = path.replace(/[\/\.\?\:\-\&\%\=]/g, '');
  // Shorten name if it's too long
  if (folderName.length > 50) {
    folderName = folderName.substring(0, 50);
  }
  return folderName;
}
