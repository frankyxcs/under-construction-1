(function() {
    'use strict';

    navBarAnimationDirective.$inject = [];

    angular.module('plingSiteApp').directive('navbarAnimation', navBarAnimationDirective);

    function navBarAnimationDirective () {
        return {
            'link' : function(event, element) {

                var topScroll = 0;

                // jQuery for page scrolling feature - requires jQuery Easing plugin
                $(function() {
                    $('body').on('click', 'a.page-scroll', function(event) {
                        var $anchor = $(event.currentTarget);

                        if ($($anchor.attr('href')).length > 0)
                            $('html, body').stop().animate({
                                'scrollTop': $($anchor.attr('href')).offset().top
                            }, 800);

                        event.preventDefault();
                    });
                });

                // Closes the Responsive Menu on Menu Item Click
                $('.navbar-collapse ul li a').click(function() {
                    if ($('.navbar-collapse').hasClass('in'))
                        $(this).closest('.collapse').collapse('toggle');
                });

                // Change background menu
                $(document).scroll(function() {
                    if ($(this).scrollTop() > topScroll) {
                        $(element).addClass('fixednav');
                    } else {
                        $(element).removeClass('fixednav');
                    }
                });

                (function() {
                    if ($(document).scrollTop() > topScroll) {
                        $(element).addClass('fixednav');
                    } else {
                        $(element).removeClass('fixednav');
                    }
                }());

            }
        };
    }

}());