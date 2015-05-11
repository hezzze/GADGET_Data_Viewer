angular.module('starter.controllers', [])

.controller('UsersCtrl', function($scope, users) {
    $scope.users = users;
})

.controller('DashCtrl', function($scope, $stateParams, $http, users, cards) {

    $scope.user = users[$stateParams.userIdx];
    $scope.cards = cards.get();



    //$scope.cards = [new Card("Heart Rate", "BPM", "time(hh:mm)", "beats/min", [80, 150], [60, 100])];

})

.controller('CardCtrl', function($scope, $http, $state, helper) {


    var dataPromise = null;
    var user = null;
    $scope.isLoading = true;
    $scope.init = function(card) {

        $scope.selected = {
            dayIdx: 0,
            hourIdx: 0,
            dvcIdx: 0
        }

        user = $scope.$parent.user;
        $scope.userInfo = user.info;
        $scope.devices = Object.keys(user.info);
        $scope.category = card.category;
        dataPromise = getDataPromise(user.idx, $scope.devices[0], card.category, $scope.selected.hourIdx, $scope.selected.dayIdx);
        $scope.isDetailClose = true;
    }


    var hostUrl = /(http:[^:]*):.*/.exec(window.location.origin)[1];

    var getDataPromise = function(userIdx, deviceId, category, hourIdx, dayIdx) {
        var req = {
            method: 'GET',
            url: hostUrl + ":5000/user/" + userIdx + "/data?device=" + encodeURIComponent(deviceId) + "&category=" + category + "&hour=" + hourIdx + "&day=" + dayIdx,
            headers: {
                'Content-Type': "application/json"
            }
        };

        return $http(req);
    };


    var updateChart = function(newValue, oldValue) {

        $scope.isLoading = true;

        //will cause this function to execute twice
        // no better solution at hand
        if (newValue.dvcIdx !== oldValue.dvcIdx) {
            $scope.selected.hourIdx = 0;
            $scope.selected.dayIdx = 0;
        }

        if (newValue.dayIdx !== oldValue.dayIdx) {
            $scope.selected.hourIdx = 0;
        }


        if (!angular.equals(newValue, oldValue)) {
            dataPromise = getDataPromise(user.idx, $scope.devices[$scope.selected.dvcIdx], $scope.category, $scope.selected.hourIdx, $scope.selected.dayIdx);
        }

        dataPromise.success(function(src) {

                $scope.isLoading = false;

                var data = src.data;
                console.log(src);

                $scope.chartData = src;
                var accessor = function(d) {
                    return d.val;
                };
 
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
                }, {
                    label: "Completion rate",
                    value: Math.round(src.completionRate * 100) + "%"
                }];

                $scope.items = items;


            })
            .error(function() {
                console.log("Update failed");
            });
    };

    $scope.$watch('selected', updateChart, true);

    $scope.toggleDetail = function() {
        $scope.isDetailClose = !$scope.isDetailClose;
    }


    // $scope.showDetail = function(userIdx, userName, card) {

    //     if (!dataPromise) return;

    //     $state.go('tab.detail', {
    //         userIdx: userIdx,
    //         userName: userName,
    //         card: card,
    //         dataPromise: dataPromise
    //     });
    // };

})

.controller('DetailCtrl', function($scope, $stateParams, users, helper, cards) {

    $scope.card = $stateParams.card;
    $scope.name = $stateParams.userName;
    $scope.user = users[$stateParams.userIdx];
    $scope.cards = cards.get();

    $stateParams.dataPromise.success(function(src) {
        var data = src.data;

        $scope.chartData = src;


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



.controller('SettingsCtrl', function($scope, cards) {

    $scope.cards = cards.get();
    $scope.filterDotsOptions = cards.filterDotsOptions;
    $scope.selectedIdx = 0;

});
