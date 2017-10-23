(function () {

    'use strict';

    angular
        .module('plingSiteApp')
        .controller('CompromissoSocialController', CompromissoSocialController);

    CompromissoSocialController.$inject = [
        '$rootScope', '$scope', 'socialCompromiseService', 'socialCompromiseFactory', 'coreApiService', '$mdPanel', '$mdSidenav'
    ];

    function CompromissoSocialController($rootScope, $scope, socialCompromiseService, socialCompromiseFactory, coreApiService, $mdPanel, $mdSidenav) {

        /**
         * TBD
         * @returns {donations} TBD.
         */
        function getSortArray() {
            var direction = 1;
            var field = $scope.tableOptions.order;

            if (!$scope.tableOptions.order)
                return [];

            if ($scope.tableOptions.order.substr(0, 1) === '-') {
                direction = -1;
                field = $scope.tableOptions.order.substr(1);
            }

            return [{'key' : field, 'order' : direction}];
        }

        /**
         * TBD
         * @param {number} currentMonth - Mês corrente
         * @param {number} currentYear - Ano corrente
         * @returns {donations} TBD.
         */
        function setDefaultTableOptions(currentMonth, currentYear) {

            $scope.tableOptions = {
                'page'         : 1,
                'total'        : 0,
                'limitOptions' : [ 5, 10, 15, 25, 50, 100 ],
                'limit'        : 10,
                'order'        : 'createdAt',

                // Mes corrente
                'filters': [
                    {
                        'key': 'month', 'value' : currentMonth
                    },
                    {
                        'key': 'year', 'value'  : currentYear
                    },
                    {
                        'key': 'filterDate', 'value'  : $scope.filterDate
                    }
                ]

            };

            $scope.tableOptions.sort = getSortArray();
        }

        /**
         * TBD
         * @param {object} tableOptions TBD
         * @returns {donations} TBD.
         */
        function setTablePaginationValues(tableOptions) {
            $scope.tableOptions.totalItems = tableOptions.totalItems;
            $scope.tableOptions.totalPages = tableOptions.totalPages;
        }

        /**
         * Atribui doações ao objeto da table.
         * @param {object} arrDonations Array de doações
         * @returns {donations} doações.
         */
        function setDonationsDataset(arrDonations) {
            $scope.donations = arrDonations;
        }

        /**
         * Obtém doações filtrando por querystring.
         * @param {number} query A querystring.
         * @returns {promise} Promise com os resultados.
         */
        $scope.logOrder = function() {

            var queryDataTable;

            $scope.tableOptions.sort = getSortArray();

            // QueryString composition
            queryDataTable = socialCompromiseFactory.getQueryStringDonationsByMonth($scope.tableOptions);

            // Calling API to get results
            getDonationsByQuery(queryDataTable);

        };

        /**
         * Obtém doações filtrando por querystring.
         * @param {number} query A querystring.
         * @returns {promise} Promise com os resultados.
         */
        function getDonationsByQuery(query) {

            if (!query) return;

            $rootScope.isAppLoading         = true;
            // Pendente
            $scope.donatedAccountsPending  = null;
            $scope.donatedAccountsConfirm  = null;
            $scope.donatedAccountsDonated  = null;
            $scope.totalMonthAmountPending = null;
            $scope.totalMonthAmountConfirm = null;
            $scope.totalMonthAmountDonated = null;
            $scope.totalAmount             = null;

            // Chamando API para buscar doações
            socialCompromiseService.getDonationsByQuery(query)
                .success(function(donationsTableData) {
                    $rootScope.isAppLoading = $scope.isAppLoading = false;

                    if (!donationsTableData.tableOptions)
                        donationsTableData = {
                            'tableOptions': {
                                'totalItems': 0,
                                'totalPages': 0
                            }
                        };

                    // Define configurações vindas do backend na table
                    setTablePaginationValues(donationsTableData.tableOptions);

                    // Valor para doação confirmado do mês anterior
                    $scope.totalDonatedAmountConfirm        = donationsTableData.totalDonatedAmountConfirm;

                    // Valor para doação do mês seguinte
                    $scope.totalDonatedAmountConfirmMonth   = donationsTableData.totalDonatedAmountConfirmMonth;

                    $scope.dateCurrent                      = donationsTableData.dateCurrent;

                    $scope.datePrev                         = donationsTableData.datePrev;

                    // Pendente
                    $scope.totalDonatedAccountsPending  = donationsTableData.totalDonatedAccountsPending;

                    // Confirmada
                    $scope.totalDonatedAccountsConfirm  = donationsTableData.totalDonatedAccountsConfirm;

                    // Doado
                    $scope.totalDonatedAccountsDonated  = donationsTableData.totalDonatedAccountsDonated;

                    // Pendente
                    $scope.donatedAccountsPending  = donationsTableData.donatedAccountsPending;

                    // Confirmada
                    $scope.donatedAccountsConfirm  = donationsTableData.donatedAccountsConfirm;

                    // Doado
                    $scope.donatedAccountsDonated  = donationsTableData.donatedAccountsDonated;

                    // --
                    $scope.totalAmount                  = donationsTableData.totalAmount;

                    // --
                    $scope.totalAmountPaginate          = donationsTableData.totalAmountPaginate;

                    // donated
                    $scope.totalMonthAmountPending  = donationsTableData.totalMonthAmountPending;

                    // Confirmada
                    $scope.totalMonthAmountConfirm  = donationsTableData.totalMonthAmountConfirm;

                    // Doado
                    $scope.totalMonthAmountDonated  = donationsTableData.totalMonthAmountDonated;


                    // CArregar as doações anteriores
                    $scope.loadingDonatedPast       = true;

                    // Define doações vindas do bacckend na table
                    setDonationsDataset(donationsTableData.donations || []);

                })
                .error(function(reason) {
                    $rootScope.isAppLoading = $scope.isAppLoading = false;

                    $rootScope.$broadcast('TOAST-ACTION', {
                        'message' : reason || 'Erro ao buscar doações, verifique sua conexão',
                        'button'  : false,
                        'cb'      : function() {}
                    });
                });

        }

        /**
         * Chamando API para buscar doações em andamento
         * @returns {promise} Promise com os resultados.
         */
        function getDonateDonated() {

            socialCompromiseService.getDonateDonated(false)
                .success(function(getDonateDonatedData) {
                    if (getDonateDonatedData)
                        $scope.donateDonated = getDonateDonatedData[0];
                })
                .error(function(reason) {
                    $rootScope.$broadcast('TOAST-ACTION', {
                        'message' : reason || 'Erro ao buscar doações em andamento, verifique sua conexão',
                        'button'  : false,
                        'cb'      : function() {}
                    });
                });
        }

        /**
         * TBD
         * @returns {donations} TBD.
         */
        $scope.tablePaginate = function() {
            $scope.getMonthDonations();
        };

        $scope.urlDriveDonate = function (_id) {
            return coreApiService.getAppCoreUrl('drive', 'download') + '/58e39e56cb5513052e98572d/donate-files/' + _id;
        };

        $scope.openModalAttach = function (event, donate) {
            var template,
                panel,
                mdPanel;

            template = '<div>' +
                '<div>Comprovantes</div>' +
                    '<div ng-if="ctrl.donate" ng-repeat="attach in ctrl.donate.attachs" >' +
                        '<a class="bills-link" download="{{attach.name}}" title="{{attach.name}}" href="{{ctrl.urlDriveDonate(attach._id)}}" >{{attach.name}}</a>' +
                    '</div>' +
                '</div>';

            panel = {
                'attachTo'      : angular.element(document.body),
                'controller'    : CompromissoSocialController,
                'controllerAs'  : 'ctrl',
                'template'      : template,
                'locals': {
                    'donate'            : donate,
                    'urlDriveDonate'    : $scope.urlDriveDonate
                },
                'hasBackdrop'   : false,
                'panelClass'    : 'panel-contract',
                'targetEvent'   : event,
                'clickOutsideToClose' : true,
                'escapeToClose' : true,
                'focusOnOpen'   : true,
                'zIndex'        : 62
            };

            /* -- Abrir panel -- */
            panel.position  = $mdPanel.newPanelPosition().relativeTo(event.currentTarget, panel).addPanelPosition($mdPanel.xPosition['ALIGN_START'], $mdPanel.yPosition['BELOW']);
            mdPanel         = $mdPanel.create(config);
            mdPanel.open();

        };

        $scope.checkFilterFate = function() {

            if ($scope.tableOptions.filters)
                $scope.tableOptions.filters.forEach(function(item, index) {
                    if (item.key === 'filterDate')
                        $scope.tableOptions.filters.splice(index, 1);
                });

            $scope.tableOptions.filters.push(
                {
                    'key'   : 'filterDate',
                    'value' : $scope.filterDate
                }
            );

            // Buscar cadastro de doação em andamento
            $scope.getDonations();

        };

        $scope.setDonationStatus = function(donationStatusValue, selectedMonth, selectedYear) {

            if ($scope.tableOptions.filters)
                $scope.tableOptions.filters.forEach(function(item, index) {
                    if (item.key === 'status')
                        $scope.tableOptions.filters.splice(index, 1);

                    if (item.key === 'month' && selectedMonth)
                        item.value = selectedMonth;

                    if (item.key === 'year' && selectedYear)
                        item.value  = selectedYear;

                    if (item.key === 'filterDate')
                        $scope.tableOptions.filters.splice(index, 1);
                });

            if (!selectedMonth)
                $scope.filterDate = false;

            if (selectedYear)
                $scope.filterDate = true;

            $scope.tableOptions.filters.push(
                {
                    'key'   : 'filterDate',
                    'value' : $scope.filterDate
                }
            );

            $scope.tableOptions.filters.push(
                {
                    'key'   : 'status',
                    'value' : donationStatusValue
                }
            );

            // Define mes Corrente
            if (selectedMonth)
                $scope.currentMonth = selectedMonth;

            if (selectedYear)
                $scope.currentYear = selectedYear;

            if (Array.isArray(donationStatusValue))
                $scope.selectedStatus = donationStatusValue;
            else
                $scope.selectedStatus = [donationStatusValue];

            // Buscar cadastro de doação em andamento
            $scope.getDonations();

        };

        /**
         * Obtém doações por mês.
         * @returns {donations} doações contidas em customer.contracts.
         */
        $scope.getMonthDonations = function() {

            // QueryString composition
            var queryDataTable = socialCompromiseFactory.getQueryStringDonationsByMonth($scope.tableOptions);

            // Calling API to get results
            getDonationsByQuery(queryDataTable);

        };

        $scope.getFilters = function (keyCode) {
            if (keyCode === 13) {
                if ($scope.tableOptions.filters)
                    $scope.tableOptions.filters.forEach(function(item, index) {
                        if (item.key === 'customer_name')
                            $scope.tableOptions.filters.splice(index, 1);
                    });

                $scope.tableOptions.filters.push(
                    {
                        'key'   : 'customer_name',
                        'value' : $scope.customerName
                    }
                );

                // Buscar cadastro de doação em andamento
                $scope.getDonations();
            }
        };

        /**
         * Obtém doações por mês.
         * @param {number} selectedMonth Mês selecionado.
         * @returns {donations} doações contidas em customer.contracts.
         */
        $scope.getDonations = function() {

            // QueryString composition
            var queryDataTable = socialCompromiseFactory.getQueryStringDonationsByMonth($scope.tableOptions);

            // Calling API to get results
            getDonationsByQuery(queryDataTable);

            if ($mdSidenav('sidenavRight').isOpen())
                return;

            $mdSidenav('sidenavRight').toggle();

        };

        $scope.changeMonthYear = function() {
            if ($scope.tableOptions.filters)
                $scope.tableOptions.filters.forEach(function(item) {
                    if (item.key === 'month')
                        item.value = $scope.currentMonth;

                    if (item.key === 'year')
                        item.value  = $scope.currentYear;

                });

            $scope.getMonthDonations($scope.currentMonth);
        };

        function getArrMonths() {
            var arrMonths = [
                {
                    'id'    : 1,
                    'name'  : 'Janeiro'
                },
                {
                    'id'    : 2,
                    'name'  : 'Fevereiro'
                },
                {
                    'id'    : 3,
                    'name'  : 'Março'
                },
                {
                    'id'    : 4,
                    'name'  : 'Abril'
                },
                {
                    'id'    : 5,
                    'name'  : 'Maio'
                },
                {
                    'id'    : 6,
                    'name'  : 'Junho'
                },
                {
                    'id'    : 7,
                    'name'  : 'Julho'
                },
                {
                    'id'    : 8,
                    'name'  : 'Agosto'
                },
                {
                    'id'    : 9,
                    'name'  : 'Setembro'
                },
                {
                    'id'    : 10,
                    'name'  : 'Outubro'
                },
                {
                    'id'    : 11,
                    'name'  : 'Novembro'
                },
                {
                    'id'    : 12,
                    'name'  : 'Dezembro'
                }
            ];

            return arrMonths;
        }

        function getArrYears() {
            var arrYears = [
                2017
            ];

            return arrYears;
        }

        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);

            if (idx > -1) {
                list.splice(idx, 1);
            }
            else {
                list.push(item);
            }

            $scope.setDonationStatus(list, $scope.currentMonth);
        };

        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };

        // Inicializa Compromisso Social
        (function() {

            $scope.isAppLoading = true;

            // Inicializa valor total doação do mês
            $scope.totalDonationsCurrentMonth = 0;

            // Inicializa Média doadores x nao doadores
            $scope.averageDonationCounter =
                { 'donators': 0, 'notDonators' : 0 };

            // Inicializa Obj de Filters
            $scope.filters          = ['doado', 'confirmado', 'pendente'];

            $scope.arrMonths        = getArrMonths();

            $scope.arrYears         = getArrYears();

            $scope.selectedStatus   = [];

            $scope.filterDate       = true;

            // Define ano Corrente
            $scope.currentYear  = new Date().getFullYear();

            $scope.currentMonth = new Date().getMonth() + 1;

            // Inicializa configurações iniciais da tabela
            setDefaultTableOptions($scope.currentMonth, $scope.currentYear);

            // Busca Doações do Mês corrente passando a configuração default da tabela
            $scope.getMonthDonations();

            // Buscar cadastro de doação em andamento
            getDonateDonated();

        }());
    }
}());
