(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('plgHorizontalBar', plgHorizontalBar);

    plgHorizontalBar.$inject = [
        'socialCompromiseService', 'socialCompromiseFactory', 'monthFactory', '$filter'
    ];


    function plgHorizontalBar(socialCompromiseService, socialCompromiseFactory, monthFactory, $filter) {

        // Template HTML
        const template = '<canvas id="compSocialHorizontalBar" class="chart-horizontal-bar"></canvas>';

        // Link Function
        function link(scope, element) {

            // Obtém querystring
            var query = '?filters=' + JSON.stringify(socialCompromiseFactory.getQueryStringLastMonthDonations(5));
            var unselectedBarColor = 'rgba(125, 195, 255, 0.4)';
            var dataSetChart = {
                'datasets': [
                    {
                        'label': 'Total doado',
                        'backgroundColor' : [
                            unselectedBarColor,
                            unselectedBarColor,
                            unselectedBarColor,
                            unselectedBarColor,
                            unselectedBarColor
                        ],
                        'borderWidth'     : 1
                    }
                ]
            };

            socialCompromiseService.getLastMonthDonationsByQuery(query)
                .success(function(lastMonthDonations) {
                    dataSetChart.labels             = lastMonthDonations.months;
                    dataSetChart.datasets[0].data   = lastMonthDonations.values;

                    // Bind Filtro Mês/Ano
                    scope.monthYears                = lastMonthDonations.months;

                    createChart(dataSetChart);
                });

            function clickBar(evt, item) {

                var splitedValues;
                var monthName;
                var selectedMonth;
                var currentYear;

                if (item.length > 0) {

                    splitedValues = item[0]._model.label.split('/');
                    monthName     = splitedValues[0];
                    currentYear   = splitedValues[1];
                    selectedMonth = monthFactory.getNumberByMonthName(monthName);

                    if (!selectedMonth) return;

                    scope.setDonationStatus('doado', selectedMonth, currentYear,  true);

                }
            }

            function createChart(lastMonthDonations) {
                new Chart(document.getElementById(element[0].id), { //eslint-disable-line
                    'type': 'horizontalBar',

                    'data': lastMonthDonations,

                    'legend'    : 'true',

                    'options': {
                        'tooltips' : {
                            'enabled': true,
                            'callbacks' : {
                                'label' : function (tooltipItems, data) {
                                    return data.datasets[tooltipItems.datasetIndex].label + ': ' + $filter('currency')(tooltipItems.xLabel);
                                }
                            }
                        },
                        'onClick' : clickBar
                    }

                });
            }
        }

        return {
            'restrict' : 'E',
            'template' : template,
            'replace'  : true,
            'link'     : link
        };
    }

}());
