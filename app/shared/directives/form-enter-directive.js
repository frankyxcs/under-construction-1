(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('keyEnter', KeyEnterDirective);

    KeyEnterDirective.$inject = [ '$timeout' ];

    function KeyEnterDirective($timeout) {
        return {
            'restrict' : 'A',
            'link'     : function(scope, elem, attrs) {

                elem.bind('keydown', function(event) {
                    if (event.keyCode === 13) {
                        $timeout(function() {
                            scope.$eval(attrs.keyEnter);
                        });
                    }
                });
            }
        };
    }

}());