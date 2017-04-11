(function () {

    'use strict';

    angular.module('plingSiteApp').service('contatoService', contatoService);

    contatoService.$inject = [ 'httpService' ];

    function contatoService(httpService) {

        this.post = function (data, cb) {
            cb = cb || angular.noop;
            httpService.post('accounts', 'contact/', {
                'name': data.name,
                'email': data.email,
                'description': data.description
            })
            .success(function (data) {
                if (!data) {
                    cb({});
                } else {
                    cb(null, data);
                }
            })
            .error(function (reason) {
                cb(reason);
            });
        };

    }

}());
