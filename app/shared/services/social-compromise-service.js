(function () {

    'use strict';

    angular
        .module('plingSiteApp')
        .service('socialCompromiseService', SocialCompromiseService);

    SocialCompromiseService.$inject = [ 'httpService' ];

    function SocialCompromiseService(httpService) {

        /**
         * Obtem lista de Doações filtrando por mês.
         * @param {string} queryString Configurações de paginação, ordenação, limite e filtros.
         * @returns {Promise} Array de doações.
         */
        this.getDonationsByQuery = function (queryString) {
            return httpService.get(null, 'accounts/bills/donations/' + queryString);
        };

        /**
         * Obtem lista de Doações filtrando por mês.
         * @param {string} queryString Configurações de paginação, ordenação, limite e filtros.
         * @returns {Promise} Array de doações.
         */
        this.getLastMonthDonationsByQuery = function (queryString) {
            return httpService.get(null, 'accounts/bills/last-month-donations/' + queryString);
        };

        /**
         * Doações já doadas.
         * @param {string} active doações ativas ou inativas
         * @returns {Promise} Array de doações.
         */
        this.getDonateDonated = function(active) {
            return httpService.get('accounts', 'bills/donations-donated/' + active);
        };


    }

}());
