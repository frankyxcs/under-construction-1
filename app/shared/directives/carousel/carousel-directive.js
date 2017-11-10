(function () {

    angular.module('plingSiteApp')
        .directive('carouselDirective', CarouselDirectice);

    CarouselDirectice.$inject = [];

    function CarouselDirectice() {

        function onLink(scope) {

            scope.nextSlide = function(carouselIndex) {
                if (carouselIndex < 3)
                    scope.carouselIndex += 1;
            };

            scope.prevSlide = function(carouselIndex) {
                if (carouselIndex > 0)
                    scope.carouselIndex -= 1;
            };

            scope.clickCallback = function(item) {
                if (scope.carouselClick)
                    scope.carouselClick(item);
            };

        }

        return {
            'restrict' : 'E',
            'link' : onLink,
            'scope' : {
                'items' : '=',
                'carouselClick' : '=',
                'isLoading' : '='
            },
            'templateUrl' : 'carousel.html'
        };
    }

}());