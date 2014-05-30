# grunt-devperf

Helps front-end developers to reach a good quality and good performances, based on [phantomas](https://github.com/macbre/phantomas) and [grunt-phantomas](https://github.com/stefanjudis/grunt-phantomas).

Day after day, while working on your project, keep an eye on performance metrics and get warnings for things you should optimize.

[![Dependency Status](https://gemnasium.com/gmetais/grunt-devperf.svg)](https://gemnasium.com/gmetais/grunt-devperf)


## Install method 1: i don't care about Grunt

**Use this minimalist installation if you just want to launch some quick tests.**

You need NodeJS v0.8 or higher. If you don't have it, go to http://nodejs.org and grab the latest version.

1) Create a directory for your grunt-devperf installation, anywhere you want. Let's call it `devperf`:
```shell
mkdir devperf
cd devperf
```

2) Install Grunt globally:
```shell
npm install grunt-cli -g
```

3) Install grunt-devperf locally:
```shell
npm install grunt-devperf
```

4) Copy the example `Gruntfile.js` to the root of your `devperf` directory:
```shell
cp node_modules/grunt-devperf/demo/smallest-config/Gruntfile.js ./
```

5) Then edit this copy of `Gruntfile.js` to insert your own list of URLs.

**It's done!** You can launch your first test with this command:
```shell
grunt
```


## Install method 2: i already love Grunt

This plugin requires Grunt `~0.4.4`.

Install the plugin:
```shell
npm install grunt-devperf --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-devperf');
```

I recommand using it as a part of your Continuous Integration system, but you can also simply use it locally while developping.


## Setup the "devperf" task

### Overview
In your project's Gruntfile, add a section named `devperf` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  devperf: {
    options: {
      urls: [
        'http://www.google.com'
      ]
    }
  }
});
```

### Options

#### options.urls
Type: `Array of Strings`
Default value: `['http://www.google.fr']`

The list of URLs you want to test. Don't forget the protocol (http:// or https://), even on localhost.

#### options.numberOfRuns
Type: `Integer`
Default value: `5`

The number of times you want phantomas to call each page.
A higher number of runs could give a better accuracy, but note that they are run in parallel and that your machine's bandwith may suffer.

#### options.timeout
Type: `Integer`
Default value: `120`

The time after which phantomas should cancel a run.

#### options.openResults
Type: `Boolean`
Default value: `false`

Automatically opens the browser on the results page when the devperf task is finished.

#### options.resultsFolder
Type: `String`
Default value: `./devperf`

This is the folder where the results will be generated, including grunt-phantomas reports.
It can be relative to your project: `./my-folder` (you might want to add this folder to your `.gitignore` file).
Or it can be anywhere else in your file system: `/var/www/devperf`


### Usage Examples

In this example, several Urls are tested

```js
grunt.initConfig({
  devperf: {
    options: {
      urls: [
        'http://www.google.com',
        'http://www.yahoo.com',
        'http://www.github.com',
        'http://www.facebook.com'
      ],
      numberOfRuns: 5,
      timeout: 120,
      openResults: true,
      resultsFolder: './devperf'
    }
  }
});
```
Then, open the `index.html` file with your browser to see the results. It is located in the results folder (`./devperf/`by default).


Results snapshot:
![grunt-devperf example results](https://raw.github.com/gmetais/grunt-devperf/master/demo/img/results.png)

About the results:
- Yes it looks like a console but it's a web page!
- Some metrics might have decimals, because they are averages of multiple runs.
- The link to the grunt-phantomas report will give you tons of details, very helpful for debugging.
- The files size are not reliable (sometimes gzipped, sometimes not). Check issue #6.



### Warnings list

#### Default list of warnings

When a metric is greater than the limit, the message is displayed.

Metric                    | Limit   | Message
--------------------------|:-------:|--------------------------------------------------------------------
requests                  | 200     | Too many requests, i guess your site is slow, isn't it?
cssCount                  | 6       | Too many CSS files, use concatenation
jsCount                   | 12      | Too many JS files, use concatenation
imageCount                | 30      | Too many images, use lazyloading
smallImages               | 20      | Too many small images (<2kB), build sprites
imageSize                 | 512000  | Total image size (bytes) is too high, try image optimisation
webfontCount              | 4       | Too many custom fonts, tell the designer you don't want that
notFound                  | 0       | Number of 404 errors
multipleRequests          | 1       | Some static assets are requested multiple times
imagesWithoutDimensions   | 5       | Number of images without dimensions
commentsSize              | 1000    | Reduce size of comments in HTML
whiteSpacesSize           | 8000    | Reduce the number of whitespaces in HTML
DOMelementsCount          | 2000    | Reduce the number of DOM elements
documentWriteCalls        | 0       | Remove all document.write() calls
jsErrors                  | 0       | Number of Javascript errors
consoleMessages           | 0       | Remove console.log or console.*whatever*
DOMqueries                | 200     | Reduce number of DOM queries
DOMqueriesDuplicated      | 30      | Many duplicated DOM queries, try to save results into variables
DOMinserts                | 100     | Reduce number of DOM insertions
jQuerySizzleCalls         | 300     | Reduce number of Sizzle calls (= jQuery DOM queries)
headersSentSize           | 20000   | Reduce size of headers sent (cookies?)


#### Modifying the warnings

In the Gruntfile, you can change any of them by adding a `warnings` option this way:

```js
grunt.initConfig({
  devperf: {
    options: {
      urls: [
        'http://www.google.com'
      ],
      warnings: [
        {
          // Changing the limit for this variable
          variable : "jsErrors",
          limit : 42,
        },
        {
          // Changing the message
          variable : "jQuerySizzleCalls",
          message : "I like this message best"
        },
        {
          // Changing the limit and the message
          variable : "DOMelementsCount",
          limit : 200,
          message: "DOM elements number is my big issue so i reduced the limit"
        },
        {
          // Disabling a warning (-1 is infinite)
          variable : "consoleMessages",
          limit : -1
        },
        {
          // Adding one of the numerous Phantomas variables not handled by grunt-devperf
          variable : "jsonCount",
          limit : 5,
          message : "I really care about having a small number of JSON requests"
        }
      ]
    }
  }
});
```

You can find the complete list of Phantomas variables and their descriptions [here](https://github.com/macbre/phantomas#metrics).
If you think one of these variables deserves a warning in grunt-devperf, don't hesitate to open an issue!



## Contributing
This project is in early stage (beta). You can help by reporting any issue, giving your feedback or coding new functionnalities.


## TODO
- Write tests
- Create profiles for phones and tablets (force viewport and UA, decrease some of the limits)


## Author
Gaël Métais. I'm a webperf freelance based in Paris. If you understand french, you can visit [my website](http://www.gaelmetais.com).
