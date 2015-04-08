angular.module('starter.services', [])

.factory('Users', function() {

    // Some fake testing data
    var users = [{
        id: 0,
        name: 'Siyang Wang',
        dataCompletionRate: '90%',
        face: 'https://lh6.googleusercontent.com/-_dwiJEb5DT4/AAAAAAAAAAI/AAAAAAAAADQ/yuvmLksvhAc/photo.jpg?sz=50'
    }, {
        id: 1,
        name: 'Lin Zhang',
        dataCompletionRate: '90%',
        face: 'https://avatars3.githubusercontent.com/xiaozhanglin?v=3&s=460'
    }, {
        id: 2,
        name: 'Zeyu He',
        dataCompletionRate: '59%',
        face: 'https://avatars3.githubusercontent.com/hezzze?v=3&s=460'
    }];

    return {
        all: function() {
            return users;
        },
        get: function(userId) {
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === parseInt(userId)) {
                    return users[i];
                }
            }
            return null;
        }
    };
})

.factory('Helper', function() {

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
