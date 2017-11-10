(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('mdInput', MdInputDirective);

    MdInputDirective.$inject = [];

    function MdInputDirective() {
        return {
            'restrict' : 'A',
            'require' : ['ngModel'],
            'link'     : function(scope, elem, attrs, ctrls) {
                var input = $(elem[0]);
                var ngModelCtrl = ctrls[0];

                input.addClass('input-item');
                $('<label>' + attrs.mdInput + '</label><span class="bar"></span>').insertAfter(input);

                scope.$watch(attrs.ngModel, function(value) {
                    if (value)
                        input.addClass('hasValue');
                    else
                        input.removeClass('hasValue');
                });

                input.on('input keydown keyup', function() {
                    if (ngModelCtrl.$viewValue)
                        input.addClass('hasValue');
                    else
                        input.removeClass('hasValue');
                });

                if (attrs.placeholder)
                    input.addClass('hasValue');
            }
        };
    }

}());