angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http) {


    function Card (title, id, labelX, labelY) {
        this.title = title;
        this.id = id
        this.chartLabelX = labelX;
        this.chartLabelY = labelY;
    }

    $scope.cards = [new Card("Heart Rate","heart_rate","time(hh:mm)", "beats/min"), new Card("Skin Temperature","skin_temperature", "time(hh:mm)", "degree(celcius)")];


})

.controller('CardCtrl', function($scope, $http) {

    $scope.init = function(card) {
        $scope.chartLabelX = card.chartLabelX;
        $scope.chartLabelY = card.chartLabelY;
        $scope.title = card.title;
        $scope.id = card.id;
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

    var updateChart = function(newValue, oldValue) {

        var req = {
          method: 'GET',
          url: "http://s3-reader.herokuapp.com/data?category=" + $scope.id + "&hour="+$scope.selected.hourIdx+"&day="+$scope.selected.dayIdx,
          headers: {
            'Content-Type': "application/json"
          }
        }

        $http(req)
            .success(function(data) {

                console.log(data);

                $scope.chartData = data;
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
