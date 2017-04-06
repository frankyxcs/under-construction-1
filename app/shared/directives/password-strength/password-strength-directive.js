(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .factory('zxcvbnFactory', zxcvbnFactory);

    function zxcvbnFactory() {
        return {
            'score': function() {
                if (typeof zxcvbn === 'undefined')
                    return false;

                var compute = zxcvbn.apply(null, arguments); //eslint-disable-line

                return compute && compute.score;
            }
        };
    }

    plgPasswordStrength.$inject = [ 'zxcvbnFactory' ];
    angular.module('plingSiteApp').directive('plgPasswordStrength', plgPasswordStrength);

    function plgPasswordStrength(zxcvbnFactory) {
        return {
            'restrict': 'E',
            'scope' : {
                'password' : '='
            },
            'templateUrl' : 'password-strength.html',
            'link': function($scope) {
                $scope.$watch('password', function(password) {
                    $scope.passwordStrength = password ? password.length > 6 && zxcvbnFactory.score(password) || 0 : null;
                }, true);
            }
        };
    }

})();