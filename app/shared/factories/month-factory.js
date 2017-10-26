(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .factory('monthFactory',  MonthFactory);

    function MonthFactory() {
        return {
            'getNumberByMonthName': function (monthName) {
                if (!monthName) return;

                switch (monthName.toLowerCase()) {
                    case 'janeiro': return 1;
                    case 'fevereiro': return 2;
                    case 'março': return 3;
                    case 'abril': return 4;
                    case 'maio': return 5;
                    case 'junho': return 6;
                    case 'julho': return 7;
                    case 'agosto': return 8;
                    case 'setembro': return 9;
                    case 'outubro': return 10;
                    case 'novembro': return 11;
                    case 'dezembro': return 12;
                }

            }
        };
    }
}());
