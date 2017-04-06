(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .controller('EmailController', EmailController);

    EmailController.$inject = [ '$scope', '$rootScope', '$routeParams', 'httpService', 'closeModal', '$timeout' ];

    function EmailController($scope, $rootScope, $routeParams, httpService, closeModal) {

        $scope.sendEmail = function(config) {
            $scope.isLoading = true;

            httpService.post('accounts', 'customers/works/' + $routeParams.id  + '/email', config)
                .success(function() {
                    $scope.isLoading = false;
                    $rootScope.$broadcast('TOAST-ACTION', { 'message' : 'Email enciado com sucesso.', 'cb' : function () {} });
                    closeModal();
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line

                    if (reason && reason.statusCode === 400)
                        $rootScope.$broadcast('TOAST-ACTION', { 'message' : 'Destinatário inexistente: ' + reason.message, 'cb' : function () {} });

                    $scope.isLoading = false;
                });
        };

        $scope.close = function() {
            closeModal();
        };
    }

}());