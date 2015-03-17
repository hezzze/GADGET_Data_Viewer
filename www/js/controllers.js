angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http) {

	$http.get('testData.json')
		.success(function(data) {
			$scope.data = data.heart_rate;
		})
		.error(function() {
			throw new Error("Read data error!");
		})
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
