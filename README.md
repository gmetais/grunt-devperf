# grunt-devperf

Helps front-end developers to maintain a good quality, based on [phantomas](https://github.com/macbre/phantomas) and [grunt-phantomas](https://github.com/stefanjudis/grunt-phantomas).

Day after day, while working on your project, keep an eye on performance metrics and get warnings for things you should optimize.


## Install method 1: I don't care about Grunt

**Use this minimalist installation if you just want to launch some tests and see the results.**

You need NodeJS v0.8 or higher. Check your version:
```shell
node -v
```
If you don't have it, go to http://nodejs.org and grab the latest version.

Install Grunt globally:
```shell
npm install -g grunt-cli
```

Create a directory for your grunt-devperf installation, anywhere you want. Let's call it `grunt-devperf`.

Copy the following two files into your directory : [package.json](https://github.com/gmetais/grunt-devperf/blob/master/demo/smallest-config/package.json) and [Gruntfile.js](https://github.com/gmetais/grunt-devperf/blob/master/demo/smallest-config/Gruntfile.js)

Install grunt-devperf by launching this command from your `grunt-devperf` directory:
```shell
npm install
```

Edit `Gruntfile.js` and insert your own list of URLs.

**It's done!** You can launch your first test with this command:
```shell
grunt
```


## Install method 2: I already love Grunt

This plugin requires Grunt `~0.4.4`.

Install the plugin:
```shell
npm install grunt-devperf --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-devperf');
```

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

The list of URLs you want to test

#### options.numberOfRuns
Type: `Integer`
Default value: `5`

The number of times you want phantomas to call each page

#### options.timeout
Type: `Integer`
Default value: `120`

The time after which phantomas should cancel a run

#### options.openResults
Type: `Boolean`
Default value: `false`

Automatically opens the browser on the results page when the devperf task is finished.


### Usage Examples

In this example, several Urls are tested

```js
grunt.initConfig({
  devperf: {
    options: {
      urls: [
        'http://www.france2.fr',
        'http://www.france3.fr',
        'http://www.france4.fr',
        'http://www.france5.fr'
        'http://www.franceo.fr'
      ],
      numberOfRuns: 5,
      timeout: 120,
      openResults: true
    }
  }
});
```
Then, open the `/devperf/index.html` file with your browser to see the results.

The entire results (including grunt-phantomas HTML and JSON reports) are in the `/devperf` folder.
You might want to add this folder to your .gitignore file.

Results snapshot:
![grunt-devperf example results](https://raw.github.com/gmetais/grunt-devperf/master/demo/img/results.png)

About the results:
- Yes it looks like a console but it's a web page!
- Some metrics might have decimals, because they are averages of multiple runs.
- The link to the grunt-phantomas report will give you tons of details, very helpful for debugging.


## Contributing
This project is in very early stage (beta). You can help by reporting any issue, giving your feedback or coding new functionnalities.

## TODO
- Find a way to show gziped file size
- Write tests
- Help people customize warnings (add, remove, change text or limit)

## Author
Gaël Métais. I'm a webperf freelance based in Paris.
If you understand french, you can visit [my website](http://www.gaelmetais.com).
