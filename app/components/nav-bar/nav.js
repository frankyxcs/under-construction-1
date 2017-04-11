(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('navBar', NavBar);

    NavBar.$inject = [ '$location', 'coreApiService' ];

    function NavBar($location, coreApiService) {
        return {
            'restict' : 'E',
            'templateUrl': 'app/components/nav-bar/nav.html',
            'link'    : function(scope) {
                var medias = coreApiService.getSocialMedia();

                scope.medias = {
                    'facebook' : medias.facebook['general'],
                    'twitter' : medias.twitter['general']
                };
                scope.goTo = function (path) {
                    if ($location.$$path === path) return;
                    $location.path(path);
                };
            }
        };
    }

}());