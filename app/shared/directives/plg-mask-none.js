(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('plgMaskNone', plgMaskNone);

    function plgMaskNone() {

        // Template HTML
        const template = '<span>{{maskNone}}</span>';

        // Link Function
        function link(scope, element, attr) {

            var arrMask = attr.value.split('');
            var mask    = '';

            arrMask.forEach(function(element, index) {
                mask += index % 2 === 0 ? element : element.replace(/[0-9]/, '*');
            });

            scope.maskNone = mask;
        }

        return {
            'restrict' : 'E',
            'replace'  : true,
            'template' : template,
            'link'     : link
        };
    }

}());
