(function () {
    'use strict';

    // injecting dependencies
    MainController.$inject = [
        '$scope', '$rootScope', '$timeout',
        '$location', '$window', 'coreApiService',
        'httpHelperService'
    ];

    // registering on angular
    angular.module('plingSiteApp').controller('MainController', MainController);

    // Main Controller
    function MainController($scope, $rootScope, $timeout, $location, $window, core, $mdToast, httpHelperService) {

        // store the url to redirect later in case the user comes from other domain
        $rootScope.isAppLoaded  = false;
        $rootScope.loadingLayer = false;
        $rootScope.isAppLoading = true;

        // Route change
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.isAppLoading = true;
            $rootScope.showUserCreateButton = false;
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.isAppLoading = false;
        });

        // Registring Logout
        $rootScope.$on('PLING-SERVICE-BAR-LOGOUT', function () {
            core.redirectToLoginWithCallback();
        });

        $rootScope.$on('PLING-REDIRECT', function (event, url) {
            $rootScope.isAppLoaded = false;
            $window.location.href = url;
        });

        $rootScope.$on('CANCEL-REQUESTS', function () {
            httpHelperService.cancelRequest();
        });

        $rootScope.goTo = function (path) {
            $location.path(path);
        };

    }
}());
