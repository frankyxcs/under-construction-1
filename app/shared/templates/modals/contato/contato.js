(function() {

    'use strict';

    ContatoController.$inject = [ '$scope', 'contatoService', 'closeModal' ];

    angular.module('plingSiteApp').controller('ContatoController', ContatoController);

    function ContatoController($scope, contatoService, closeModal) {

        $scope.close = function() {
            closeModal();
        };

        $scope.send = function() {
            contatoService.post($scope.info, function (err) {
                if (err) return console.log(err);
                closeModal();
            });
        };

        (function init() {

        }());
    }

}());