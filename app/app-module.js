(function () {
    'use strict';

    // Module dependencies injection
    angular.module('plingSiteApp', [
        'plingUiLite',
        'plingSiteApp.templates',
        'ngRoute',
        'angular-carousel',
        'ui.mask',
        'ui.utils.masks'
    ])

        .config(function ($compileProvider) {

            // Remove Angular Debugger to improve performance
            $compileProvider.debugInfoEnabled(false);
        });

}());
