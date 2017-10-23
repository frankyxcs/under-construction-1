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

        .config(function ($compileProvider) {

            // Remove Angular Debugger to improve performance
            $compileProvider.debugInfoEnabled(false);
        });

}());
