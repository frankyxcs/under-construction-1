(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('openNewTab', openNewTabDirective);

    function openNewTabDirective() {
        return {
            'restrict' : 'A',
            'link': function (scope, element, attrs) {
                element.bind('click', function () {
                    var win = window.open(attrs.openNewTab, '_blank');

                    win.focus();
                });
            }
        };
    }

}());
