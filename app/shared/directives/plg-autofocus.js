(function () {

    plgAutoFocusDirective.$inject = [ '$timeout' ];

    angular
        .module('plingSiteApp')
        .directive('plgAutoFocus', plgAutoFocusDirective);

    function plgAutoFocusDirective ($timeout) {
        return {
            'restrict' : 'A',
            'link': function (scope, element, attrs) {
                scope.$watch(attrs.plgAutoFocus, function(newValue) {
                    if (newValue)
                        $timeout(function() {
                            element[0].focus();
                        });
                });
            }
        };
    }

}());