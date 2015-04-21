angular.module('starter.controllers', [])

.controller('UsersCtrl', function($scope, Users) {
    $scope.users = Users.all();
})

.controller('DashCtrl', function($scope, $stateParams, $http, Users, settings) {

    $scope.user = Users.get($stateParams.userId);
    $scope.settings = settings.get();

    function Card(title, id, labelX, labelY, threshold) {
        this.title = title;
        this.id = id
        this.chartLabelX = labelX;
        this.chartLabelY = labelY;
        this.chartThreshold = {
            max: threshold[0],
            min: threshold[1]
        }
    }

    $scope.cards = [new Card("ECG", "RawHeartValue", "time(hh:mm)", "uV"), new Card("Heart Rate", "heart_rate", "time(hh:mm)", "beats/min", [100, 60]), new Card("Skin Temperature", "skin_temperature", "time(hh:mm)", "degree(celcius)", [37.5, 32.5])];


})

.controller('CardCtrl', function($scope, $http, $state) {


    var dataPromise = null;

    $scope.init = function(card) {
        $scope.chartLabelX = card.chartLabelX;
        $scope.chartLabelY = card.chartLabelY;
        $scope.title = card.title;
        $scope.id = card.id;
        $scope.chartThreshold = card.chartThreshold;
        dataPromise = getDataPromise($scope.id, $scope.selected.hourIdx, $scope.selected.dayIdx);
    }

    $scope.days = ["Day 1", "Day 2"];
    $scope.selected = {
        dayIdx: 0,
        hourIdx: 0
    }
    $scope.hours = [];

    for (var i = 0; i < 24; i++) {
        $scope.hours.push(((20 + i) % 24) + ":08" + " - " + ((20 + i + 1) % 24) + ":08");
    }

    var getDataPromise = function(id, hourIdx, dayIdx) {
        var req = {
            method: 'GET',
            url: "http://s3-reader.herokuapp.com/data?category=" + id + "&hour=" + hourIdx + "&day=" + dayIdx,
            headers: {
                'Content-Type': "application/json"
            }
        };

        return $http(req);
    };


    var updateChart = function(newValue, oldValue) {

        if (!angular.equals(newValue, oldValue)) {
            dataPromise = getDataPromise($scope.id, $scope.selected.hourIdx, $scope.selected.dayIdx);
        }

        dataPromise.success(function(data) {

                console.log(data);

                $scope.chartData = data;
            })
            .error(function() {
                console.log("Update failed");
            });
    };

    $scope.$watchGroup(["selected.dayIdx", "selected.hourIdx"], updateChart);

    $scope.showDetail = function(userId, userName, category, card) {

        if (!dataPromise) return;

        $state.go('tab.detail', {
            userId: userId,
            category: category,
            userName: userName,
            card: card,
            dataPromise: dataPromise
        });
    };

})

.controller('DetailCtrl', function($scope, $stateParams, Users, helper) {

    $scope.card = $stateParams.card; 
    $scope.name = $stateParams.userName;
    $scope.user = Users.get($stateParams.userId);
    $scope.selectedIdx = 0;



    $stateParams.dataPromise.success(function(data) {
        $scope.chartData = data;

        var accessor = function (d) { return d.val; };
        var maxValue = helper.max(data, accessor);
        var minValue = helper.min(data, accessor);
        var avgValue = helper.avg(data, accessor, true);


        var items = [{
            label: "Maximum",
            value: maxValue
        }, {
            label: "Minimum",
            value: minValue
        }, {
            label: "Average",
            value: avgValue
        }];

        $scope.items = items;

    });


})



.controller('SettingsCtrl', function($scope, settings) {

    $scope.settings = settings.get();
    $scope.filterDotsOptions = settings.filterDotsOptions;

});
