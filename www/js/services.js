angular.module('starter.services', [])

.factory('userService', function($q, $http) {


    var avatarsDeferred = $q.defer();

    $http({
        method: 'GET',
        url: "https://api.github.com/users/hezzze/following",
        headers: {
            'Content-Type': "application/json"
        }
    }).success(function(data) {
        var faces = data.map(function(d) {
            return "https://github.com/identicons/" + d.login + ".png";
        })
        avatarsDeferred.resolve({
            i: 0,
            next: function() {
                if (this.i === faces.length) this.i = 0;
                return faces[this.i++];
            }
        });
    });

    var hostUrl = /(http:[^:]*):.*/.exec(window.location.origin)[1];

    var usersPromise = $http({
        method: 'GET',
        url: hostUrl + ":5000/info",
        headers: {
            'Content-Type': "application/json"
        }
    });

    var userDeferred = $q.defer();

    $q.all([avatarsDeferred.promise, usersPromise]).then(function(results) {
        var avatarGen = results[0];
        var data = results[1].data;
        var names = [
            "William Perry",
            "Robert Phillips",
            "Ruth Morgan",
            "Michael Lewis",
            "James Murphy",
            "James Johnson",
            "William Diaz"
        ];

        var user, dvcRateSum, dvcCount;

        //add extra field for UI
        for (var i in data) {
            user = data[i];
            dvcRateSum = 0;
            dvcCount = 0;
            for (var dvcId in user.info) {
                dvcRateSum += user.info[dvcId].completionRate;
                dvcCount++;
            }

            user.name = names[i];
            user.idx = i;
            user.face = avatarGen.next();
            user.totalCompletionRate = dvcRateSum / dvcCount;
        }

        userDeferred.resolve(data);

    });

    return userDeferred.promise;

})

.factory('cards', function() {

    function Card(title, category, labelX, labelY, domain, threshold, settings) {
        this.title = title;
        this.category = category;
        this.chartLabelX = labelX;
        this.chartLabelY = labelY;
        this.domain = domain;
        this.showDots = settings.showDots;
        this.showBars = settings.showBars;
        this.filterDotsBy = settings.filterDotsBy;

        if (threshold !== undefined && threshold !== null) {
            this.chartThreshold = {
                min: threshold[0],
                max: threshold[1]
            };
        }
    }


    var cards = [new Card("Heart Rate", "BPM", "time(hh:mm)", "beats/min", [80, 150], [60, 100], {
        showDots: true,
        showBars: false,
        filterDotsBy: "default"
    }), new Card("Skin Temperature", "BodyTemp", "time(hh:mm)", "degree(celcius)", [0, 50], [32.5, 37.5], {
        showDots: true,
        showBars: false,
        filterDotsBy: "default"
    }), new Card("ECG", "RawHeartValue", "time(hh:mm)", "uV", [-3000, 3000], null, {
        showDots: false,
        showBars: false,
        filterDotsBy: "default"
    })];

    var filterDotsOptions = [{
        text: "Show all",
        val: "default"
    }, {
        text: "Only show dots within range",
        val: "normal"
    }, {
        text: "Only show outliers",
        val: "outliers"
    }];

    return {
        get: function() {
            return cards;
        },
        filterDotsOptions: filterDotsOptions
    };
})

.factory('helper', function() {

    function bestfuncGen(initValue, isBetter) {

        return function f(arr, accessor) {
            var best = initValue;
            var val;

            for (var i = 0; i < arr.length; i++) {
                val = accessor(arr[i]);

                if (isBetter(val, best)) {
                    best = val;
                }
            }

            return best;
        };

    }

    var max = bestfuncGen(-Infinity, function(a, b) {
        return a > b;
    });

    var min = bestfuncGen(Infinity, function(a, b) {
        return a < b;
    });

    return {
        max: max,
        min: min,
        avg: function(arr, accessor, shouldRound) {
            var sum = 0;

            for (var i = 0; i < arr.length; i++) {
                sum += accessor(arr[i]);
            }

            return shouldRound ? Math.round(sum / arr.length) : (sum / arr.length);
        }
    };
});
