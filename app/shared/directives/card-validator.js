(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('cardValidator', CardValidator);

    CardValidator.$inject = [ 'cardValidatorService' ];

    function CardValidator(cardValidatorService) {
        return {
            'restict' : 'A',
            'require' : 'ngModel',
            'link'    : function(scope, elem, attrs, ngModel) {
                ngModel.$validators[attrs.cardValidator] = function(modelValue) {
                    var value = modelValue;

                    if (!value) return false;

                    if (attrs.cardValidator === 'number')
                        return cardValidatorService.validateCardNumber(value).isValid;
                    else if (attrs.cardValidator === 'date') {
                        if (value.length < 4)
                            return false;

                        value = value.substr(0, 2) + value.substr(value.length-2, 2);

                        return cardValidatorService.validateDate(value).isValid;
                    } else
                        return false;
                };
            }
        };
    }

}());