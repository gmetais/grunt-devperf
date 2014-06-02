/*
 * grunt-devperf
 * https://github.com/gaelmetais/grunt-devperf
 *
 * Copyright (c) 2014 Gaël Métais
 * Licensed under the MIT license.
 */

/*jslint node: true */
'use strict';

var fs = require('fs');

module.exports = DevperfProcessor;

function DevperfProcessor(options) {

  var devperfProcessorFunctions = {

    /**
     * Creates all the data needed by the display for one URL
     * 
     * @param [String] url The tested URL
     * 
     * @return An object with the data ready to give to the template
     */
    processData : function(url, folderName) {
      var page = {
        url : url,
        timingsHistory : [],
        gruntPhantomasReport : folderName + '/index.html'
      };

      var pageDataFolder = options.resultsFolder + '/' + folderName + '/data';
      var pageData = this.readPhantomasJSONFiles(pageDataFolder);

      pageData.forEach(function(phantomasReport, key) {

        // Get all metrics for most recent data
        if (key === 0) {
          for (var metric in phantomasReport.json.metrics) {
            page[metric] = phantomasReport.json.metrics[metric].average;
          }
        }

        // Get history for each
        page.timingsHistory.push({
          'timestamp': phantomasReport.timestamp,
          'timeToFirstByte': phantomasReport.json.metrics.timeToFirstByte.average,
          'onDOMReadyTime': phantomasReport.json.metrics.onDOMReadyTime.average,
          'windowOnLoadTime': phantomasReport.json.metrics.windowOnLoadTime.average,
          'httpTrafficCompleted': phantomasReport.json.metrics.httpTrafficCompleted.average
        });

      });

      return page;
    },

    /**
     * Reads every JSON files from one grunt-phantomas results folder
     * 
     * @param [String] gruntPhantomasFolder Path to a grunt-phantomas results folder
     * 
     * @return An object with all results
     */
    readPhantomasJSONFiles : function(gruntPhantomasFolder) {
      var results = [];
      
      // Look into the folder
      var pageJsonFiles = fs.readdirSync(gruntPhantomasFolder);

      // Sort by timestamp
      pageJsonFiles.sort(function(a, b) {
        return parseInt(a, 10) < parseInt(b, 10) ? 1 : -1;
      });

      pageJsonFiles.forEach(function(jsonFileName, key) {
        
        // Filter JSON files
        if (jsonFileName.indexOf('.json') === 13) {

          var timestamp = jsonFileName.substring(0, 13);
          var filePath = gruntPhantomasFolder + '/' + jsonFileName;
          var content = fs.readFileSync(filePath);
          var json = JSON.parse(content);


          results.push({
            timestamp: timestamp,
            json: json
          });

        }
      });
      return results;
    }
  
  };

  return devperfProcessorFunctions;
}