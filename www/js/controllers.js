angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http) {

    $scope.days = ["Day 1", "Day 2"];
    $scope.selected = {
      dayIdx: 0,
      hourIdx: 0
    }
    $scope.hours = [];

    for (var i = 0; i < 24; i++) {
        $scope.hours.push(((20 + i) % 24) + ":08" + " - " + ((20 + i + 1) % 24) + ":08");
    }

    var updateChart = function(newValue, oldValue) {

        var req = {
          method: 'GET',
          url: "http://s3-reader.herokuapp.com/data?category=heart_rate&hour="+$scope.selected.hourIdx+"&day="+$scope.selected.dayIdx,
          headers: {
            'Content-Type': "application/json"
          }
        }

        $http(req)
            .success(function(data) {

                console.log(data);

                var heartRateInfo = {
                    data: data,
                    labelX: "time(hh:mm)",
                    labelY: "beats/min"
                }

                $scope.chartInfo = heartRateInfo;
            })
            .error(function() {
                console.log("Update failed");
            });
    };

    $scope.$watchGroup(["selected.dayIdx", "selected.hourIdx"], updateChart);



})

.controller('ChatsCtrl', function($scope, Chats) {
    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('SettingsCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
