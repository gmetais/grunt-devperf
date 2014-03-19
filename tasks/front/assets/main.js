$(document).ready(function() {

    function init() {
        loadConf();
    }

    function renderPages(data, conf) {
        var source = $("#page-template").html();
        var template = Handlebars.compile(source);
        var html = template(data);

        html += "<br><br>Complete.";

        $("#pageContainer").append(html);
    }

    function loadData(path, conf) {
        $.getJSON(path).done(function(data) {

            var graphs = [];

            for (var i=0, imax=data.pages.length ; i<imax ; i++) {
                var pageData = data.pages[i];
                
                // Warnings calculations
                var pageWarnings = [];
                for (var j=0, jmax=conf.warnings.length; j<jmax ; j++) {
                    var warning = conf.warnings[j];
                    if (warning.variable in pageData && pageData[warning.variable] > warning.limit) {
                        pageWarnings.push({
                            message: warning.message,
                            value: pageData[warning.variable]
                        });
                    }
                }
                data.pages[i].warnings = pageWarnings;

                // Graphs data fetching
                var graphSettings = {
                    colors: ['cyan', 'white', 'yellow', 'magenta'],
                    chart: {
                        type: 'line',
                        backgroundColor: 'transparent',
                        animation: false
                    },
                    title: {text: ''},
                    legend: {enabled: false},
                    credits: {enabled: false},
                    xAxis: {
                        labels: {enabled: false},
                        lineColor: 'lime',
                        type: 'datetime'
                    },
                    yAxis: {
                        title: {text: ''},
                        type: 'datetime',
                        labels: {
                            formatter: function() {
                                return this.value / 1000 +'s';
                            },
                            style: {
                                color: 'lime'
                            }
                        },
                        lineColor: 'lime',
                        gridLineColor: 'rgba(0, 255, 0, 0.3)',
                        tickPixelInterval : 25,
                        min: 0
                    },
                    tooltip: {
                        //pointFormat: '{series.name} = {point.y:.0f}ms [{point.name}]<br>',
                        formatter: function() {
                            var date = (new Date(this.x * 1000)).toLocaleString();
                            var s = '<b>'+ date +'</b>';
                            
                            $.each(this.points, function(i, point) {
                                s += '<br/>' + point.series.name + ': ' + point.y + 'ms';
                            });
                            
                            return s;
                        },
                        shared: true
                    },
                    plotOptions: {
                        line: {
                            marker: {
                                enabled: false,
                                symbol: 'diamond',
                                radius: 2,
                                states: {
                                    hover: {enabled: true}
                                }
                            }
                        },
                        series: {
                            animation: false
                        }
                    }
                };

                var ttfb = [];
                var odrt = [];
                var wolt = [];
                var htcd = [];
                var dates = [];
                for (var j=0, jmax=pageData.timingsHistory.length; j<jmax ; j++) {
                    ttfb.push([pageData.timingsHistory[j].timestamp, pageData.timingsHistory[j].timeToFirstByte]);
                    odrt.push([pageData.timingsHistory[j].timestamp, pageData.timingsHistory[j].onDOMReadyTime]);
                    wolt.push([pageData.timingsHistory[j].timestamp, pageData.timingsHistory[j].windowOnLoadTime]);
                    htcd.push([pageData.timingsHistory[j].timestamp, pageData.timingsHistory[j].httpTrafficCompleted]);
                }
                graphSettings.series = [{
                    name: 'timeToFirstByte',
                    data: ttfb
                }, {
                    name: 'onDOMReadyTime',
                    data: odrt
                }, {
                    name: 'windowOnLoadTime',
                    data: wolt
                }, {
                    name: 'httpTrafficCompleted',
                    data: htcd
                }];
                console.log(graphSettings);


                graphs.push(graphSettings);
            }

            renderPages(data, conf);

            // TODO : find a better way with CSS
            $("#interlace").height($(document).height());

            // Load graphs
            for (var i=0, max=graphs.length ; i<max ; i++) {
                $("#graph" + i).highcharts(graphs[i]);
            }

        }).fail(function() {
            showError("ERR: couldn\'t load results file : " + path);
        });
    }

    function loadConf() {
        var confFile = "settings.json";
        $.getJSON(confFile).done(function(conf) {
            loadData("results.json", conf);
        }).fail(function() {
            showError("ERR: couldn\'t load conf file : " + confFile);
        });
    }

    function showError(message) {
        $("#pageContainer").append('<div class="red">' + message + '</div>');
    }

    $(document).ready(init);
});

Handlebars.registerHelper('meter', function(value, max, low, high) {
    var charNumber = 60;
    var percentage = Math.round((value / max) * charNumber);
    var gauge = [];
    
    var className = "black yellow-background";
    if (value < low) {
        className = "black green-background";
    } else if (value > high) {
        className = "black red-background";
    }

    for (var j=0 ; j<charNumber ; j++) {
        if (charNumber - percentage <= j) {
            gauge.push('<span class="' + className + '">.</span>');
        } else {
            gauge.push('<span class="black cyan-background">.</span>');
        }
    }
    return new Handlebars.SafeString("[" + gauge.join('') + "]");
});