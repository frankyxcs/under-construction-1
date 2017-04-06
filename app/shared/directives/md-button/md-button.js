(function() {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('mdButton', MdButtonDirective);

    MdButtonDirective.$inject = [];

    function MdButtonDirective() {
        return {
            'restrict' : 'A',
            'link'     : function(scope, elem, attrs) {
                var raw = elem[0];

                $(raw).addClass('md-button md-primary');

                $(raw).on('click', function(e) {
                    var x, y, c, clickX, clickY, box, setX, setY, ripple;

                    if (attrs.disabled)
                        return;

                    x      = e.pageX;
                    y      = e.pageY;
                    clickY = y - $(this).offset().top;
                    clickX = x - $(this).offset().left;
                    box    = this;

                    setX   = parseInt(clickX); // eslint-disable-line
                    setY   = parseInt(clickY); // eslint-disable-line
                    ripple = '<svg class="ink"> \ <circle cx="' + setX + '" cy="' + setY + '" r="' + 0 + '"></circle> \ </svg>';

                    $(this).find('.ink').remove();
                    $(this).append(ripple);

                    c = $(box).find('circle');
                    c.animate({ 'r' : $(box).outerWidth() },
                        {
                            'duration' : 333,
                            'step'     : function(val) { c.attr('r', val); },
                            'complete' : function() { c.fadeOut('fast'); }
                        });

                    return true;

                });
            }
        };
    }

}());