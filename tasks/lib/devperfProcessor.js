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
     * Reads every JSON files from one grunt-phantomas results folder
     * 
     * @param {String} gruntPhantomasFolder Path to a grunt-phantomas results folder
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
    },

    /**
     * Creates all the data needed by the display for one URL
     * 
     * @param {String} url The tested URL
     * @param {String} device One of these: desktop/tablet/phone/all
     * @param {String} folderName The folder where the results are
     * 
     * @return An object with the data ready to give to the template
     */
    processData : function(url, device, folderName) {
      var page = {
        url : url,
        timingsHistory : [],
        gruntPhantomasReport : folderName + '/' + device + '/index.html'
      };

      var pageDataFolder = options.resultsFolder + '/' + folderName + '/' + device + '/data';
      var pageData = this.readPhantomasJSONFiles(pageDataFolder);

      pageData.forEach(function(phantomasReport, key) {

        // Get all metrics for most recent data
        if (key === 0) {
          for (var metric in phantomasReport.json.metrics) {
            page[metric] = phantomasReport.json.metrics[metric].median;
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
     * Writes the results to the results folder, chosing the good output format
     * 
     * @param {Object} results The results in the JSON format
     * @param {Object} settings The options
     * 
     * @return {String} Path of the output file
     */
    writeResults : function(results, settings) {
      
      // Copy assets
      var frontFilesPath = __dirname + '/../front';
      var assets = ['main.js', 'main.css', 'interlace.png', 'handlebars-v1.3.0.js', 'jquery-2.1.0.min.js', 'highcharts.js'];
      assets.forEach(function(assetName) {
        var fileContent = fs.readFileSync(frontFilesPath + '/assets/' + assetName);
        fs.writeFileSync(settings.resultsFolder + '/assets/' + assetName, fileContent);
      });

      // Write result file
      var resultsFilePath = settings.resultsFolder + '/results.json';
      var resultsJSON = JSON.stringify(results, null, 4);
      fs.writeFileSync(resultsFilePath, resultsJSON);

      // Write settings file for the front
      var settingsFilePath = settings.resultsFolder + '/settings.json';
      var settingsJSON = JSON.stringify(settings, null, 4);
      fs.writeFileSync(settingsFilePath, settingsJSON);

      // Write index.html
      var indexPath = settings.resultsFolder + '/index.html';
      var indexHtml = fs.readFileSync(frontFilesPath + '/index.html', {encoding: 'utf8'});
      indexHtml = indexHtml.replace('/*%%RESULTS%%*/', 'var results = ' + resultsJSON);
      indexHtml = indexHtml.replace('/*%%SETTINGS%%*/', 'var settings = ' + settingsJSON);
      fs.writeFileSync(indexPath, indexHtml);

      return indexPath;
    }
  };

  return devperfProcessorFunctions;
}
