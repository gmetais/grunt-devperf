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

  /**
   * This grunt task reads the config and creates the phantomas task (and the devperfAfter task)
   */
  grunt.registerTask('devperf', 'Helps front-end developers to maintain a good quality, based on phantomas and grunt-phantomas.', function() {

    // Merge task-specific and/or target-specific options with these defaults
    var options = this.options({
      urls: [
        'http://www.google.fr'
      ],
      desktopWarnings: [],
      tabletWarnings: [],
      phoneWarnings: [],
      numberOfRuns: 5,
      timeout: 120,
      openResults: false,
      resultsFolder: './devperf',
      device: 'desktop',
      phantomasOptions: {}
    });

    // Merge user defined warnings with defaults
    mergeWarningsLists(options);

    // Check correct usage of options.device
    if (options.device !== 'desktop' && options.device !== 'tablet' && options.device !== 'phone' && options.device !== 'all') {
      grunt.fail.warn('Unknown device "' + options.device + '". Choose one of these: [desktop tablet phone all].');
    }

    // Inject the phantomas config into grunt config
    grunt.config.set('phantomas', generatePhantomasConfig(options));
    grunt.task.run('phantomas');

    // Inject the config into devperfAfter task
    grunt.config.set('devperfAfter', {options: options});
    grunt.task.run('devperfAfter');
  });

  /**
   * This grunt task is added automatically inside the grunt config
   */
  grunt.registerTask('devperfAfter', 'Task to run after phantomas', function() {
    
    grunt.task.requires('phantomas');

    var options = this.options({});
    var devperfProcessor = require('./lib/devperfProcessor')(options);

    // Read and process the data from the phantomas JSON files
    var pages = [];
    options.urls.forEach(function(url) {
      grunt.log.writeln('Processing data for ' + url);
      pages.push(devperfProcessor.processData(url, options.device, sanitizeFolderName(url)));
    });

    // Write the results files
    var resultFilePath = devperfProcessor.writeResults({pages: pages}, options);
    grunt.log.ok('Devperf created new \'index.html\' file at \'' + resultFilePath + '\'');

    // Open the index.html file in browser (if the option is true)
    if (options.openResults) {
      require('grunt-open/tasks/open')(grunt);
      grunt.config.set('open.devperf_auto_task', {path: resultFilePath});
      grunt.task.run('open:devperf_auto_task');
    }
  });
};

/**
 * Removes unwanted characters from the URL to generate a unique id
 * 
 * @param {String} url
 *
 * @return {String}
 */
function sanitizeFolderName(url) {
  var folderName = url.replace(/[\/\.\?\:\-\&\%\=\+]/g, '');
  // Shorten name if it's too long
  if (folderName.length > 50) {
    folderName = folderName.substring(0, 50);
  }
  return folderName;
}


function mergeWarningsLists(options) {
  
  // Merging function
  var warningsMerger = function(device) {
    var defaultWarnings = grunt.file.readJSON(__dirname + '/settings/' + device + '.json');
    var optionsWarnings = options[device + 'Warnings'];
    
    defaultWarnings.forEach(function(defaultWarn) {
      var found = false;
      optionsWarnings.forEach(function(userWarn) {
        if (userWarn.variable === defaultWarn.variable) {
          found = true;
          if (userWarn.message === undefined) {
            userWarn.message = defaultWarn.message;
          } else if (userWarn.limit === undefined) {
            userWarn.limit = defaultWarn.limit;
          } else if (userWarn.message === undefined && userWarn.limit === undefined) {
            grunt.log.error('Warning: ' + userWarn.variable + ' is misconfigured, it has been ignored.');
            userWarn.limit = -1;
            userWarn.message = "Ignored";
          }
        }
      });
      if (!found) {
        optionsWarnings.push(defaultWarn);
      }
    });
  };

  ['desktop', 'tablet', 'phone'].forEach(function(device) {
    if (options.device === device || options.device === 'all') {
      warningsMerger();
    }
  })
}

/**
 * Creates the config for grunt-phantomas
 * 
 * @param {Object} options The entire options object
 *
 * @return {Object} The entire grunt-phantomas options object
 */
function generatePhantomasConfig(options) {
  
  // Generator function
  var configGenerator = function(url, device) {
    return {
      options: {
        indexPath: options.resultsFolder + '/' + sanitizeFolderName(url) + '/' + device + '/',
        url: url,
        numberOfRuns: options.numberOfRuns,
        options: {
          timeout: options.timeout,
          phone: (device === 'phone'),
          tablet: (device === 'tablet')
        }
      }
    };
  };

  var config = {};
  options.urls.forEach(function(url) {
    ['desktop', 'tablet', 'phone'].forEach(function(device) {
      if (options.device === device || options.device === 'all') {
        config[device + '_' + sanitizeFolderName(url)] = configGenerator(url, device);
      }
    });
  });

  return config;
}
