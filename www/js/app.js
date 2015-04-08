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
        }
    })



    .state('tab.user', {
        url: '/user/:userId',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
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
                right: 0,
                bottom: 50,
                left: 35
            },
            ratio = 0.50,
            width, height, svg, chartW, chartH;

        var container = element[0].parentElement;

        function draw(data) {

            if (!data) return;

            svg.selectAll('*').remove();

            var accessor = function(d) {
                return d.val;
            }

            var maxVal = d3.max(data, accessor);
            var minVal = d3.min(data, accessor);

            var timeX = d3.time.scale()
                .domain([new Date(data[0].date), new Date(data[data.length - 1].date)])
                .range([0, chartW]);

            var y = d3.scale.linear()
                .domain([minVal, maxVal])
                .range([chartH, 0])
                .nice();

            var line = d3.svg.line()
                .interpolate("linear")
                .x(function(d, i) {
                    return timeX(new Date(d.date));
                })
                .y(function(d, i) {
                    return y(d.val);
                });


            // y axis
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis().scale(y).ticks(Math.ceil(chartH / Y_TICK_H)).orient("left"));

            //x axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + chartH + ")")
                .call(d3.svg.axis().scale(timeX).ticks(Math.ceil(chartW / X_TICK_W)).tickFormat(d3.time.format.utc("%H:%M")).orient("down"));

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
                .attr("class", "line")
                .attr("d", line);

        }

        function getComputedInnerWidth(container) {

            var style = window.getComputedStyle(container);

            function f(s) {
                return parseInt(s.substr(0, s.length - 2));
            }

            return container.clientWidth - f(style.getPropertyValue('padding-left')) - f(style.getPropertyValue('padding-right'));

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


        width = getComputedInnerWidth(container);
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

            width = getComputedInnerWidth(container);

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

    }


    return {
        restrict: 'E',
        scope: {
            val: "=",
            labelX: "=",
            labelY: "="
        },
        link: link
    }


})
