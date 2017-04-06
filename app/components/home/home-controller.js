(function() {

    'use strict';

    HomeController.$inject = [ '$rootScope', '$scope', '$location', 'httpService', '$localstorage', '$window', 'coreApiService', 'modalService' ];

    angular.module('plingSiteApp').controller('HomeController', HomeController);

    function HomeController($rootScope, $scope, $location, httpService, $localstorage, $window, core, modalService) {

        function findMediaLink() {
            var medias = core.getSocialMedia();
            var currentBusiness = core.getCurrentBusiness();

            $rootScope.medias = {
                'facebook' : medias.facebook[currentBusiness],
                'twitter' : medias.twitter[currentBusiness]
            };
        }

        function getWorks(cb) {
            var items, works = [];

            httpService.get('accounts', 'customers/works', '?business=' + core.getCurrentBusiness())
                .success(function(data) {
                    while (data.length > 12) {

                        items = data.splice(0, 12).map(function(item) {
                            var testimony = item.testimony.find(function(r) {
                                return r.site_name && r.site_name.indexOf('Marca') >= 0;
                            });

                            var mockup = testimony.files.find(function(t) {
                                return t.type === 'small';
                            });

                            item.imageUrl = 'https://s3.amazonaws.com/pling-customers/' + item.associated_customer._id + '/ticket-files/' + mockup._id;

                            return item;
                        });

                        works.push(items);
                    }
                    cb(null, works);
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line
                    cb(reason);
                });
        }

        $scope.playVideo = function() {
            $('#videoModal').modal('show');
            $scope.showVideo = true;
        };

        $scope.closeVideo = function() {
            $('#videoModal').modal('hide');
            $scope.showVideo = false;
        };

        $scope.workDetails = function(item) {
            $location.path('/marca/trabalhos/' + item._id);
        };

        $scope.openModal = function() {
            if ($scope.isDisabledHire) return;

            modalService.showModal({
                'templateUrl' : 'criar-conta.html',
                'controller'  : 'CriarContaController'
            }).then(function(modal) {
                modal.show();
                $scope.isDisabledHire = true;
                modal.closed.then(function() {
                    $scope.isDisabledHire = false;
                });
            });
        };

        $rootScope.isAppLoaded = true;

        (function init() {
            var env = $localstorage.get('PLING-CURRENT-ENV');

            $rootScope.isAppLoaded = true;
            $scope.carouselIndex = 0;

            httpService
                .get('accounts', 'products/Login/' + env)
                .success(function(urlData) {
                    $rootScope.loginUrl =  urlData.callbackUrl;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line
                });

            delete $window.localStorage['PLING-TOKEN'];
            delete $window.localStorage['PLING-APPS'];
            delete $window.localStorage['PLING-USER'];

            findMediaLink();

            $scope.carouselLoading = true;
            getWorks(function(err, data) {
                $scope.carouselLoading = false;

                $scope.worksBlock = data || [];
            });

        }());

    }

}());