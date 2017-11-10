(function () {
    'use strict';

    angular.module('plingSiteApp').config(['$routeProvider', '$locationProvider', AppRouter]);

    function AppRouter($routeProvider, $locationProvider) {

        $routeProvider

            .when('/', {
                'templateUrl'    : 'app/components/home/home.html',
                'controller'     : 'HomeController',
                'reloadOnSearch' : false
            })

            .when('/compromisso-social', {
                'templateUrl'    : 'app/components/compromisso/compromisso-social.html',
                'controller'     : 'CompromissoSocialController',
                'reloadOnSearch' : false
            })

            .when('/quem-somos', {
                'templateUrl'    : 'app/components/quem-somos/quemsomos.html',
                'reloadOnSearch' : false
            })

            .otherwise({
                'redirectTo': '/'
            });

        $locationProvider.html5Mode(true);

    }
}());
