(function () {
    'use strict';

    // Module dependencies injection
    angular.module('plingSiteApp', [
        'plingUiLite',
        'ngMaterial',
        'ngAnimate',
        'md.data.table',
        'plingSiteApp.templates',
        'ngRoute',
        'angular-carousel',
        'ui.mask',
        'ui.utils.masks',
        'chart.js'
    ])

    .config(function ($mdThemingProvider, $compileProvider) {

        // Remove Angular Debugger to improve performance
        $compileProvider.debugInfoEnabled(false);

        $mdThemingProvider.theme('default')
            .primaryPalette('blue', {
                'default': '800',
                'hue-1': '100',
                'hue-2': '500',
                'hue-3': '900'
            })
            .accentPalette('blue', {
                'default': '800',
                'hue-1': '100',
                'hue-2': '500',
                'hue-3': '900'
            });
    });

    angular.module('arrow-up.svg', []).run(['$templateCache', function($templateCache) {
        $templateCache.put('arrow-up.svg',
            '<svg style="transform:rotate(180deg)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"> <path fill="#000000" d="M3,13H15V11H3M3,6V8H21V6M3,18H9V16H3V18Z" /></svg>');
    }]);

}());
