(function () {

    angular
        .module('plingSiteApp')
        .factory('socialCompromiseFactory', socialCompromiseFactory);

    function socialCompromiseFactory() {

        function getQueryStringDonationsByMonth(tableConfig) {

            var queryString =
                '?limit='   + tableConfig.limit +
                '&page='    + tableConfig.page +
                '&sort='    + JSON.stringify(tableConfig.sort) +
                '&filters=' + JSON.stringify(tableConfig.filters);

            return queryString;
        }

        function getQueryStringLastMonthDonations(monthsQty) {
            var i, monthNumber, filters, arrNumberMonths = [];
            var currentMonth = new Date().getMonth() + 1;
            var currentYear  = new Date().getFullYear();

            for (i = 0; i < monthsQty; i++) {
                monthNumber = currentMonth - i;
                arrNumberMonths.push(monthNumber);
            }

            filters = [
                {
                    'key'   : 'month',
                    'value' : arrNumberMonths
                },
                {
                    'key'   : 'year',
                    'value' : currentYear
                }
            ];

            return filters;
        }

        function getQueryStringStatusDonation(tableConfig, statusKeyValue) {
            var queryString =
                '?limit='   + tableConfig.limit +
                '&page='    + tableConfig.page +
                '&sort='    + JSON.stringify(tableConfig.sort);

            var arrCopy = angular.copy(tableConfig.filters);

            // Aproveita filtros pré definidos e complementar a pesquisa

            // Verificar se o campo já não está no array
            if (!angular.equals(statusKeyValue, {}))
                arrCopy.filter(function(filter, index) {
                    if (filter.key === statusKeyValue.key) {

                        // Se o valor for igual substituir
                        if (filter.value === statusKeyValue.value) {
                            tableConfig.filters[index] = statusKeyValue;
                        }

                        // Se não for colocar em um array de valores
                        else {


                            if (!Array.isArray(tableConfig.filters[index].value))
                                tableConfig.filters[index].value = [tableConfig.filters[index].value];

                            // Inserindo valor no array
                            tableConfig.filters[index].value.push(statusKeyValue.value);
                        }

                    // Se for diferente adicionar ao array
                    } else if (index + 1 === tableConfig.filters.length) {
                        tableConfig.filters.push(statusKeyValue);
                    }
                });

            queryString += '&filters=' + JSON.stringify(tableConfig.filters);

            return queryString;
        }

        return {

            // Doações por Mês
            'getQueryStringDonationsByMonth'  : getQueryStringDonationsByMonth,

            // Doações dos últimos {x} meses
            'getQueryStringLastMonthDonations': getQueryStringLastMonthDonations,

            // Doações por status
            'getQueryStringStatusDonation'  : getQueryStringStatusDonation
        };
    }

}());
