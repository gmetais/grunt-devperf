/*
 * grunt-devperf
 * https://github.com/gaelmetais/grunt-devperf
 *
 * Copyright (c) 2014 Gaël Métais
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var dataRoot = 'devperf';
var outputFile = dataRoot + '/results.json';

module.exports = function(grunt) {
  require('grunt-phantomas/tasks/phantomas')(grunt);

  grunt.registerTask('devperfAfter', 'Task to run after phantomas', function() {
    
    grunt.task.requires('phantomas');

    var pages = [];
    var options = this.options({});
    options.urls.forEach(function(url) {
      var folderName = sanitizeFolderName(url);

      var page = {
        url : url,
        timingsHistory : [],
        gruntPhantomasReport : folderName + '/index.html'
      };
    
      var pageDataFolder = dataRoot + '/' + folderName + '/data';
      grunt.log.writeln('Looking for result files in ' + pageDataFolder);
      
      var pageJsonFiles = fs.readdirSync(pageDataFolder);

      pageJsonFiles.sort(function(a, b) {
        return parseInt(a, 10) < parseInt(b, 10) ? 1 : -1;
      }).forEach(function(jsonFileName, key) {
        if (jsonFileName.indexOf('.json') === 13) {
          var timestamp = jsonFileName.substring(0, 13);

          var filePath = pageDataFolder + '/' + jsonFileName;
          grunt.log.writeln('Openning ' + filePath + ' ...');
          var content = fs.readFileSync(filePath);
          var json = JSON.parse(content);

          // Avoid problems with the old json file format of grunt-phantomas (before v0.7.0) by ignoring them
          if (json.metrics) {

            // Get all metrics for most recent data
            if (key === 0) {
              for (var metric in json.metrics) {
                page[metric] = json.metrics[metric].average;
              }
            }

            // Get history for each
            page.timingsHistory.push({
              'timestamp': timestamp,
              'timeToFirstByte': json.metrics.timeToFirstByte.average,
              'onDOMReadyTime': json.metrics.onDOMReadyTime.average,
              'windowOnLoadTime': json.metrics.windowOnLoadTime.average,
              'httpTrafficCompleted': json.metrics.httpTrafficCompleted.average
            });

          }
        }
      });

      pages.push(page);
    });

    // Write result file
    fs.writeFileSync(outputFile, JSON.stringify({pages: pages}, null, 4));
    grunt.log.writeln('File "' + outputFile + '" created.');

    // Write settings file for the front
    var settingsFilePath = dataRoot + '/settings.json';
    fs.writeFileSync(settingsFilePath, JSON.stringify(options, null, 4));
    grunt.log.writeln('File "' + settingsFilePath + '" created.');

    // Copy assets
    var frontFilesPath = __dirname + '/front';
    grunt.file.copy(frontFilesPath + '/assets/main.js', dataRoot + '/assets/main.js');
    grunt.file.copy(frontFilesPath + '/assets/main.css', dataRoot + '/assets/main.css');
    grunt.file.copy(frontFilesPath + '/assets/interlace.png', dataRoot + '/assets/interlace.png');
    grunt.file.copy(frontFilesPath + '/assets/handlebars-v1.3.0.js', dataRoot + '/assets/handlebars-v1.3.0.js');
    grunt.file.copy(frontFilesPath + '/assets/jquery-2.1.0.min.js', dataRoot + '/assets/jquery-2.1.0.min.js');
    grunt.file.copy(frontFilesPath + '/assets/highcharts.js', dataRoot + '/assets/highcharts.js');
    grunt.log.writeln('Assets copied.');

    // Write index.html
    var indexHtml = grunt.file.read(frontFilesPath + '/index.html');
    indexHtml = indexHtml.replace('/*%%RESULTS%%*/', 'var results = ' + JSON.stringify({pages: pages}, null, 4));
    indexHtml = indexHtml.replace('/*%%SETTINGS%%*/', 'var settings = ' + JSON.stringify(options, null, 4));
    var indexPath = dataRoot + '/index.html';
    grunt.file.write(indexPath, indexHtml);

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
      warnings: [
        {
          variable : "requests",
          limit : 200,
          message: "Too many requests, i guess your site is slow, isn't it?"
        },
        {
          variable : "cssCount",
          limit : 6,
          message: "Too many CSS files, use concatenation"
        },
        {
          variable : "jsCount",
          limit : 12,
          message: "Too many JS files, use concatenation"
        },
        {
          variable : "imageCount",
          limit : 30,
          message: "Too many images, use lazyloading"
        },
        {
          variable : "webfontCount",
          limit : 4,
          message: "Too many custom fonts, tell the designer you don't want that"
        },
        {
          variable : "notFound",
          limit : 1,
          message: "404 errors number"
        },
        {
          variable : "smallImages",
          limit : 20,
          message: "Too many small images, build sprites"
        },
        {
          variable : "imagesWithoutDimensions",
          limit : 5,
          message: "Number of images without dimensions"
        },
        {
          variable : "commentsSize",
          limit : 1000,
          message: "Reduce size of comments in HTML"
        },
        {
          variable : "whiteSpacesSize",
          limit : 5000,
          message: "Reduce the number of whitespaces in HTML"
        },
        {
          variable : "DOMelementsCount",
          limit : 2000,
          message: "Reduce DOM elements number"
        },
        {
          variable : "documentWriteCalls",
          limit : 0,
          message: "Remove all document.write() calls"
        },
        {
          variable : "jsErrors",
          limit : 0,
          message: "Javascript errors"
        },
        {
          variable : "consoleMessages",
          limit : 0,
          message: "Remove console.log or console.*whatever*"
        },
        {
          variable : "DOMqueries",
          limit : 200,
          message: "Reduce number of DOM queries"
        },
        {
          variable : "DOMqueriesDuplicated",
          limit : 30,
          message: "Too many duplicated DOM queries"
        },
        {
          variable : "DOMinserts",
          limit : 200,
          message: "Too many DOM insertions"
        },
        {
          variable : "headersSentSize",
          limit : 20000,
          message: "Reduce size of headers sent (cookies?)"
        },
        {
          variable : "jQuerySizzleCalls",
          limit : 300,
          message: "Reduce number of Sizzle calls (= jQuery DOM queries)"
        }
      ],
      numberOfRuns: 5,
      timeout: 120,
      openResults: false
    });

    // Inject the phantomas config into grunt config
    var phantomasConfig = {};
    options.urls.forEach(function(url) {
      phantomasConfig[sanitizeFolderName(url)] = {
        options: {
          indexPath: './' + dataRoot + '/' + sanitizeFolderName(url) + '/',
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
  var folderName = path.replace(/[\/\.\?\:\-]/g, '');
  // Shorten name if it's too long
  if (folderName.length > 50) {
    folderName = folderName.substring(0, 50);
  }
  return folderName;
}
