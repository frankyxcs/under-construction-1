(function() {
    'use strict';

    StateService.$inject = [];

    angular.module('plingSiteApp').service('stateService', StateService);

    function StateService() {
        this.getStates = function() {
            return [{
                'name' : 'Acre',
                'uf' : 'AC'
            },
            {
                'name' : 'Alagoas',
                'uf' : 'AL'
            },
            {
                'name' : 'Amazonas',
                'uf' : 'AM'
            },
            {
                'name' : 'Amapá',
                'uf' : 'AL'
            },
            {
                'name' : 'Bahia',
                'uf' : 'BA'
            },
            {
                'name' : 'Ceará',
                'uf' : 'CE'
            },
            {
                'name' : 'Distrito Federal',
                'uf' : 'DF'
            },
            {
                'name' : 'Espírito Santo',
                'uf' : 'ES'
            },
            {
                'name' : 'Goiás',
                'uf' : 'GO'
            },
            {
                'name' : 'Maranhão',
                'uf' : 'MA'
            },
            {
                'name' : 'Minas Gerais',
                'uf' : 'MG'
            },
            {
                'name' : 'Mato Grosso do Sul',
                'uf' : 'MS'
            },
            {
                'name' : 'Mato Grosso',
                'uf' : 'MT'
            },
            {
                'name' : 'Pará',
                'uf' : 'PA'
            },
            {
                'name' : 'Paraíba',
                'uf' : 'PB'
            },
            {
                'name' : 'Pernambuco',
                'uf' : 'PE'
            },
            {
                'name' : 'Piauí',
                'uf' : 'PI'
            },
            {
                'name' : 'Paraná',
                'uf' : 'PR'
            },
            {
                'name' : 'Rio de Janeiro',
                'uf' : 'RJ'
            },
            {
                'name' : 'Rio Grande do Norte',
                'uf' : 'RN'
            },
            {
                'name' : 'Roraima',
                'uf' : 'RR'
            },
            {
                'name' : 'Rondônia',
                'uf' : 'RN'
            },
            {
                'name' : 'Rio Grande do Sul',
                'uf' : 'RS'
            },
            {
                'name' : 'Santa Catarina',
                'uf' : 'SC'
            },
            {
                'name' : 'Sergipe',
                'uf' : 'SE'
            },
            {
                'name' : 'São Paulo',
                'uf' : 'SP'
            },
            {
                'name' : 'Tocantins',
                'uf' : 'TO'
            }];
        };
    }
}());