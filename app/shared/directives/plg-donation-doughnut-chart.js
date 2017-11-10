(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('plgDoughnutChat', plgDoughnutChat);

    function plgDoughnutChat() {

        // Link Function
        function link(scope, element) {

            function clickBar(evt, item) {

                var status;

                if (item.length > 0) {

                    if (item[0]._model.label === 'Doados')
                        status = 'doado';

                    if (item[0]._model.label === 'Confirmados')
                        status = 'confirmado';

                    if (item[0]._model.label === 'Pendentes')
                        status = 'pendente';

                    scope.setDonationStatus(status);

                }
            }

            new Chart(document.getElementById(element[0].id), { //eslint-disable-line
                'type'    : 'doughnut',
                'options' : {
                    'responsive': false,
                    'onClick' : clickBar
                },
                'data'    : {
                    'labels'    : [ 'Doados', 'Confirmados', 'Pendentes'],
                    'datasets'  : [{
                        'backgroundColor': [ '#1165ae', '#309c40', '#e66e33' ],
                        'data'  : [
                            scope.donatedAccountsDonated > 0 ? Math.round(100 * scope.donatedAccountsDonated / (scope.donatedAccountsConfirm + scope.donatedAccountsPending + scope.donatedAccountsDonated)) : 0,
                            scope.donatedAccountsConfirm > 0 ? Math.round(100 * scope.donatedAccountsConfirm / (scope.donatedAccountsConfirm + scope.donatedAccountsPending + scope.donatedAccountsDonated)) : 0,
                            scope.donatedAccountsPending > 0 ? Math.round(100 * scope.donatedAccountsPending / (scope.donatedAccountsConfirm + scope.donatedAccountsPending + scope.donatedAccountsDonated)) : 0
                        ]
                    }]
                }
            });
        }

        return {
            'restrict' : 'A',
            'replace'  : true,
            'link'     : link
        };
    }
}());
