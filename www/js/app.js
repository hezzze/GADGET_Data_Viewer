// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-users.html',
                controller: 'UsersCtrl'

            }
        },
        resolve: {
            users: "userService"
        }
    })



    .state('tab.user', {
        url: '/user/:userIdx',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        },
        resolve: {
            users: "userService"
        }
    })

    .state('tab.detail', {
        url: '/user/:userId/:category',
        params: {
            userName: null,
            dataPromise: null,
            card: null
        },
        views: {
            'tab-dash': {
                templateUrl: 'templates/card-detail.html',
                controller: 'DetailCtrl'
            }
        },
        resolve: {
            users: "userService"
        }
    })

    .state('tab.settings', {
        url: '/settings',
        views: {
            'tab-settings': {
                templateUrl: 'templates/tab-settings.html',
                controller: 'SettingsCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

})

.directive('hzLineChart', function($window) {

    var link = function(scope, element, attrs) {

        var N = 40;
        var Y_TICK_H = 30;
        var X_TICK_W = 100;

        var margin = {
                top: 20,
                right: 30,
                bottom: 50,
                left: 50
            },
            ratio = 0.50,
            width, height, svg, chartW, chartH, barW, barH,
            timeX, yScale;

        var container = element[0].parentElement;


        width = getComputedInnerWidth(container);
        resize();


        scope.$watch('val', function(newVal, oldVal) {

            if (!newVal) {
                return;
            }

            updateChart(newVal);
        }, attrs.strict !== undefined);

        scope.$watchGroup(["showDots", "showBars", "filterDotsBy"], function(newVal, oldVal) {

            if (!scope.val) {
                return;
            }
            toggleBars(scope.val);
            toggleDots(scope.val);
        });

        //since we need to destroy the listener later
        // so we kept a reference here
        var resizeHandler = function() {

            width = getComputedInnerWidth(container);

            //for the case that the element might not
            // be destroyed if going to a cached state
            // where the parent's width will be 
            // negative
            if (width <= 0) return;

            resize();
            updateChart(scope.val);
        };

        window.addEventListener('resize', resizeHandler);

        element.on('$destroy', function() {
            window.removeEventListener('resize', resizeHandler);
        });

        //assumes resize is called before
        // so svg, chartW, timeX is available
        function updateChart(val) {
            if (!val) return;

            drawChart(val);
            toggleBars(val);
            toggleDots(val);

        }

        //assert data is not null
        function drawChart(val, maxVal, minVal) {

            var data = val.data;

            svg.selectAll('*').remove();

            timeX = d3.time.scale()
                .domain([new Date(val.timeRange[0]), new Date(val.timeRange[1])])
                .range([0, chartW]);


            yScale = d3.scale.linear()
                .domain(scope.domain)
                .range([chartH, 0])
                .nice();

            var line = d3.svg.line()
                .interpolate("linear")
                .x(function(d, i) {
                    return timeX(new Date(d.date));
                })
                .y(function(d, i) {
                    return yScale(d.val);
                });


            // y axis
            var yAxis = svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis().scale(yScale).ticks(Math.ceil(chartH / Y_TICK_H)).orient("left"));



            //x axis
            var xAxis = svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + chartH + ")")
                .call(d3.svg.axis().scale(timeX).ticks(Math.ceil(chartW / X_TICK_W)).tickFormat(d3.time.format.utc("%H:%M")).orient("down"));

            [xAxis, yAxis].forEach(function(axis) {
                axis.selectAll("path,line")
                    .style({
                        'fill': 'none',
                        'stroke': "#000",
                        "shape-rendering": "crispEdges"
                    });
            });

            //if the threshold is undefined
            // then no lines will be shown

            var thresholdGroup = svg.append("g")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 1);
            var thresholdLabelGroup = svg.append("g");

            for (var key in scope.threshold) {

                var v = scope.threshold[key];

                if (v >= maxVal || v <= minVal) continue;

                var yVal = yScale(scope.threshold[key]);

                thresholdGroup.append("line")
                    .attr("x1", 0)
                    .attr("x2", chartW)
                    .attr("y1", yVal)
                    .attr("y2", yVal)
                    .style("stroke-dasharray", "10,5");


                thresholdLabelGroup.append("text")
                    .attr("x", chartW + 10)
                    .attr("y", yVal)
                    .attr("class", "label")
                    .text(key)
                    .attr("text-anchor", "middle");
            }



            var yLabelOffset = {
                y: -3,
                x: 6
            };

            //y label
            //reference: http://stackoverflow.com/questions/11189284/d3-axis-labeling
            svg.append("text")
                .attr("x", yLabelOffset.x)
                .attr("y", yLabelOffset.y)
                .attr("class", "label")
                .text(scope.labelY);

            // var yLabelOffset = {
            //     x: ""
            // }

            var xLabelOffset = {
                y: 36
            }

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", chartW / 2)
                .attr("y", chartH + xLabelOffset.y)
                .attr("class", "label")
                .text(scope.labelX);

            var path = svg.append("g")
                .append("path")
                .datum(data)
                .style({
                    'fill': 'none',
                    'stroke': '#E589A2',
                    'stroke-width': '1.5px'
                })
                .attr("d", line);


        }

        function getComputedInnerWidth(container) {

            var style = window.getComputedStyle(container);

            function f(s) {
                return parseInt(s.substr(0, s.length - 2));
            }

            return container.clientWidth - f(style.getPropertyValue('padding-left')) - f(style.getPropertyValue('padding-right'));

        }

        // ngModels 
        // showBars: boolean
        function toggleBars(val) {

            var data = val.data;

            svg.selectAll('.bars').remove();

            if (!scope.showBars) return;

            // calculate the width for each bar based on the chart width
            var barW = chartW / 3 / (60 - 1);
            svg.append("g")
                .attr("class", "bars")
                .selectAll("rect")
                .data(data)
                .enter().append("rect")
                .style({
                    "fill": "rgb(175, 215, 210)",
                    "stroke": "none",
                    "opacity": "0.5"
                })
                .attr("x", function(d) {
                    return timeX(new Date(d.date)) - barW / 2;
                })
                .attr("y", function(d) {
                    return yScale(d.val);
                })
                .attr("width", barW)
                .attr("height", function(d) {
                    return chartH - yScale(d.val);
                });
        }


        // ngModels 
        // showDots: boolean
        // filterDotsBy: string ("normal"|"outliers" default) 
        // threshold: {
        //     max: integer
        //     min: integer
        // }
        function toggleDots(val) {

            var data = val.data;

            svg.selectAll('.dots').remove();

            if (!scope.showDots) return;

            var filteredData;



            if (!scope.filterDotsBy || !scope.threshold) {
                filteredData = angular.copy(data);
            } else {

                var maxVal = scope.threshold.max;
                var minVal = scope.threshold.min;

                switch (scope.filterDotsBy) {
                    case "normal":
                        filteredData = data.filter(function(d) {
                            return d.val <= maxVal && d.val >= minVal;
                        });
                        break;
                    case "outliers":
                        filteredData = data.filter(function(d) {
                            return d.val > maxVal || d.val < minVal;
                        });
                        break;
                    default:
                        filteredData = angular.copy(data);
                }
            }

            var dotRadius = chartW / 3 / (60 - 1);
            svg.append("g")
                .attr("class", "dots")
                .selectAll("circle")
                .data(filteredData)
                .enter().append("circle")
                .style({
                    "fill": "darkgray",
                    "stroke": "none"
                })
                .attr("cx", function(d) {
                    return timeX(new Date(d.date));
                })
                .attr("cy", function(d) {
                    return yScale(d.val);
                })
                .attr("r", dotRadius);

        }


        function resize() {

            chartW = width - margin.right - margin.left;

            height = ratio * width;

            chartH = height - margin.top - margin.bottom;

            //clear the svg
            d3.select(element[0]).select("svg").remove();

            svg = d3.select(element[0]).append('svg')
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }



        // http://www.ng-newsletter.com/posts/d3-on-angular.html
        // using this method seems to be causing the resize handler
        // be called twice when the page load, and also called when
        // state changes
        // scope.$watch(function() {
        //     return angular.element($window)[0].innerWidth;
        // }, resizeHandler);

    }


    return {
        restrict: 'E',
        scope: {
            val: "=",
            labelX: "@",
            labelY: "@",
            threshold: "=",
            domain: "=",
            showBars: '=',
            showDots: '=',
            filterDotsBy: '='
        },
        link: link
    }


})

.directive('hzProgress', function() {

    var link = function(scope, element, attrs) {

        var width, height, svg, barW, barH = parseInt(scope.height),
            barRadius = 0.5 * barH,
            widthRatio = parseFloat(scope.widthRatio),
            threshold = parseFloat(scope.threshold) || 0.6,
            goodColor = "#9CC588", //greenish
            badColor = "#EF4E3A", //redish
            margin = {
                top: 10,
                right: barH * 2,
                bottom: 0,
                left: 0
            };

        var container = element[0].parentElement;

        function draw(data) {

            if (!data) return;

            var val = parseFloat(data);


            svg.selectAll('*').remove();

            var x = d3.scale.linear()
                .domain([0, 1])
                .range([0, barW]);


            svg.append("rect")
                .attr('width', barW)
                .attr('height', barH)
                .attr('rx', barRadius)
                .attr('ry', barRadius)
                .attr("fill", "#e9f1f4");


            svg.append("rect")
                .attr('width', x(val))
                .attr('height', barH)
                .attr('rx', barRadius)
                .attr('ry', barRadius)
                .attr("fill", val > threshold ? goodColor : badColor);

            svg.append("text")
                .attr("x", barW + Math.round(barH / 2))
                .attr("y", Math.round(2 * barH / 3))
                .attr("font-family", "Arial")
                .attr("font-size", "small")
                .text(Math.round(val * 100) + "%");

        }

        function getComputedInnerWidth(container) {

            var style = window.getComputedStyle(container);

            function f(s) {
                return parseInt(s.substr(0, s.length - 2));
            }

            return container.clientWidth - f(style.getPropertyValue('padding-left')) - f(style.getPropertyValue('padding-right'));

        }



        function resize() {

            barW = width - margin.right - margin.left;

            height = barH + margin.top + margin.bottom;

            //clear the svg
            d3.select(element[0]).select("svg").remove();

            svg = d3.select(element[0]).append('svg')
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        }


        width = getComputedInnerWidth(container) * widthRatio;
        resize();

        scope.$watch('val', function(newVal, oldVal) {

            if (!newVal) {
                return;
            }

            draw(newVal);
        }, attrs.strict !== undefined);

        //since we need to destroy the listener later
        // so we kept a reference here
        var resizeHandler = function() {

            width = getComputedInnerWidth(container) * widthRatio;

            //for the case that the element might not
            // be destroyed if going to a cached state
            // where the parent's width will be 
            // negative
            if (width <= 0) return;

            resize();
            draw(scope.val);
        };

        window.addEventListener('resize', resizeHandler);

        element.on('$destroy', function() {
            window.removeEventListener('resize', resizeHandler);
        });

        // http://www.ng-newsletter.com/posts/d3-on-angular.html
        // using this method seems to be causing the resize handler
        // be called twice when the page load, and also called when
        // state changes
        // scope.$watch(function() {
        //     return angular.element($window)[0].innerWidth;
        // }, resizeHandler);

    };


    return {
        restrict: 'E',
        scope: {
            val: "=",
            height: "@",
            widthRatio: "@",
            threshold: "@"
        },
        link: link
    }


})


//reference
//https://github.com/angular-ui/bootstrap/blob/master/src/collapse/collapse.js#L31
.directive('collapse', ['$animate', function($animate) {

    return {
        link: function(scope, element, attrs) {
            function expand() {
                element.removeClass('collapse').addClass('collapsing');
                $animate.addClass(element, 'in', {
                    to: {
                        height: element[0].scrollHeight + 'px'
                    }
                }).then(expandDone);
            }

            function expandDone() {
                element.removeClass('collapsing');
                // element.css({
                //     height: 'auto'
                // });
            }

            function collapse() {
                element
                // IMPORTANT: The height must be set before adding "collapsing" class.
                // Otherwise, the browser attempts to animate from height 0 (in
                // collapsing class) to the given height here.
                    .css({
                        height: element[0].scrollHeight + 'px'
                    })
                    // initially all panel collapse have the collapse class, this removal
                    // prevents the animation from jumping to collapsed state
                    .removeClass('collapse')
                    .addClass('collapsing');

                $animate.removeClass(element, 'in', {
                    to: {
                        height: '0'
                    }
                }).then(collapseDone);
            }

            function collapseDone() {
                element.css({
                    height: '0'
                }); // Required so that collapse works when animation is disabled
                element.removeClass('collapsing');
                element.addClass('collapse');
            }

            scope.$watch(attrs.collapse, function(shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            });
        }
    };
}]);
