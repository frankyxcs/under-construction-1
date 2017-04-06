(function() {
    'use strict';

    CustomerFactory.$inject = [];

    angular.module('plingSiteApp').factory('customerFactory', CustomerFactory);

    function CustomerFactory() {

        function getCustomerPayload (customer) {
            var newCustomer = {
                'name': customer.name,
                'email': customer.email,
                'address' : customer.address,
                'addressNumber'     : customer.addressNumber,
                'addressComplement' : customer.addressComplement,
                'city' : customer.city,
                'neighborhood' : customer.neighborhood,
                'phone' : customer.phone,
                'phoneTwo' : customer.phoneTwo,
                'postalCode' : customer.postalCode,
                'state' : customer.state
            };

            if (customer.plingQuestion)
                newCustomer.plingQuestion = customer.plingQuestion;

            if (customer._id)
                newCustomer._id = customer._id;

            if (customer.cpfCnpj && customer.cpfCnpj.length === 11)
                newCustomer.cpf = customer.cpfCnpj;
            else if (customer.cpfCnpj && customer.cpfCnpj.length > 11)
                newCustomer.cnpj = customer.cpfCnpj;

            return newCustomer;
        }

        function getCustomer(customer) {
            var newCustomer = {
                '_id' : customer._id,
                'name': customer.name,
                'email': customer.email,
                'address' : customer.address,
                'addressNumber'     : customer.addressNumber,
                'addressComplement' : customer.addressComplement,
                'city' : customer.city,
                'neighborhood' : customer.neighborhood,
                'phone' : customer.phone,
                'postalCode' : customer.postalCode,
                'state' : customer.state,
                'plingQuestion' : customer.plingQuestion
            };

            if (customer.phoneTwo)
                newCustomer.phoneTwo = customer.phoneTwo;

            if (customer.cpf)
                newCustomer.cpf = customer.cpf;
            else if (customer.cnpj)
                newCustomer.cnpj = customer.cnpj;

            return newCustomer;
        }

        return {
            'getCustomer' : getCustomer,
            'getCustomerPayload' : getCustomerPayload
        };

    }

}());