# grunt-devperf

> Helps front-end developers to maintain a good quality, based on [phantomas](https://github.com/macbre/phantomas) and [grunt-phantomas](https://github.com/stefanjudis/grunt-phantomas).

## Getting Started
This plugin requires Grunt `~0.4.4`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-devperf --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-devperf');
```

## The "devperf" task

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
Default value: `'http://www.google.fr'`

The list of URLs you want to test

#### options.numberOfRuns
Type: `Integer`
Default value: `5`

The number of times you want phantomas to call each page

#### options.timeout
Type: `Integer`
Default value: `120`

The time after which phantomas should cancel a run


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
      timeout: 120
    }
  }
});
```
Then, open the '/devperf/index.html' file with your browser to see the results.

The entire results (including grunt-phantomas HTML and JSON reports) are in the '/devperf' folder. You might want to add this folder to your .gitignore file.


Results snapshot :
![grunt-devperf example results](https://raw.github.com/gmetais/grunt-devperf/master/demo/img/results.png)

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style.

## TODO
- An option to open browser automaticaly when test is finished.
- Find a way to show gziped file size
- Add graphs for other metrics evolution over time (not just timings evolution)
- Write tests

## Author
Gaël Métais. I'm a webperf freelance based in Paris.
If you understand french, you can visit [my website](http://www.gaelmetais.com).
