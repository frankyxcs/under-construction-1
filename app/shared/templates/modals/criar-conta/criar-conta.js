(function() {

    'use strict';

    CriarContaController.$inject = [ '$rootScope', '$scope', '$window', '$location', '$interval', '$localstorage',
        'httpService', 'customersService', 'credentialsService', 'cepService', 'customerFactory', 'stateService', 'coreApiService', 'closeModal', '$timeout' ];

    angular.module('plingSiteApp').controller('CriarContaController', CriarContaController);

    function CriarContaController($rootScope, $scope, $window, $location, $interval, $localstorage,
        httpService, customersService, credentialsService, cepService, customerFactory, stateService, coreApiService, closeModal, $timeout) {

        var newCredential;

        function saveCustomer(customer, cb) {
            var classificationName = coreApiService.getCurrentBusiness();
            var siteClassification = $scope.classifications.find(function(item) {
                return item.key === classificationName && !item.isSubclassification;
            });
            var newCustomer = customerFactory.getCustomerPayload(customer);

            newCustomer.pwd = customer.pwd;

            delete customer.confPwd;

            if (siteClassification)
                newCustomer.classification = siteClassification.code;
            else
                return cb({'message' : 'Classificação não encontrada.'});

            customersService.createCustomer(newCustomer).then(function(customerData) {
                customer._id = customerData._id;
                credentialsService.login({ 'usr' : customerData.email, 'pwd' : customer.pwd})
                    .then(function(data) {
                        cb(null, data);
                    }, function(err) {
                        cb(err);
                    });
            }, function error(reason) {
                customer.confPwd = customer.pwd;
                console.log(reason); // eslint-disable-line
                cb(reason);
            });
        }

        function updateCustomer(customer, cb) {
            var customerToUpdate = customerFactory.getCustomerPayload(customer);

            customersService.updateCustomer(customerToUpdate).then(function(data) {
                return cb(null, data);
            }, function(reason) {
                return cb(reason);
            });
        }

        function getProduct(appModule, cb) {
            var env = $localstorage.get('PLING-CURRENT-ENV');

            httpService.get('accounts', 'products/marca/' + env, appModule)
            .success(function(productData) {
                cb(null, productData);
            })
            .error(function(reason) {
                cb(reason);
            });
        }

        function sendPayment(payment, product, cb) {
            var env = $localstorage.get('PLING-CURRENT-ENV');
            var payload = {
                'products'     : [product._id],
                'creditCard'   : {
                    'cardName'   : payment.cardName,
                    'cardNumber' : payment.cardNumber,
                    'validDate'  : payment.validDate,
                    'cvv'        : payment.cvv
                },
                'installments' : payment.installments
            };

            httpService.post('accounts', 'payments/' + env, payload)
                .success(function(data) {
                    cb(null, data);
                })
                .error(function(reason) {
                    cb(reason);
                });

        }

        function checkCustomer(customer, cb) {
            $scope.isLoading = true;
            if (customer._id)
                updateCustomer(customer, function(err) {
                    if (err) {
                        $scope.isLoading = false;
                        return cb(err);
                    }

                    cb(null, customer);
                });
            else {
                customer.email = newCredential.email;
                customer.pwd = newCredential.pwd;
                saveCustomer(customer, function(err) {
                    if (err) {
                        $scope.isLoading = false;
                        return cb(err);
                    }

                    cb(null, customer);
                });
            }
        }

        function genericError() {
            $scope.responseMessage = 'Ocorreu um erro ao realizar contratação.';
            $scope.responseText = 'Tente novamente mais tarde.';
            $scope.showError = true;
            $scope.index = 6;
        }

        function getClassifications() {
            httpService.get('accounts', 'customers/classifications')
                .success(function(classificationData) {
                    $scope.classifications = classificationData.filter(function(item) {
                        return !item.isSubclassification;
                    });
                    $scope.subclassifications = classificationData.filter(function(item) {
                        return item.isSubclassification;
                    });
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line
                    genericError();
                });
        }

        // async loadind password strength estimation
        function loadZxcvbn(cb) {
            var script, r, tag;
            var src = 'https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js';

            if (typeof zxcvbn !== 'undefined')
                return;

            r = false;
            script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.onload = script.onreadystatechange = function() {
                if ( !r && (!this.readyState || this.readyState === 'complete') ) {
                    r = true;
                    cb(null, this);
                }
            };
            tag = document.getElementsByTagName('script')[0];
            tag.parentNode.insertBefore(script, tag);
        }

        $scope.redirectToPanel = function () {
            var token = $localstorage.get('PLING-TOKEN');

            $scope.isLoading = true;

            getProduct('painelDoClienteApp', function(err, appData) {
                if (err) return genericError();

                $localstorage.clearAll();

                $window.location.href = appData.callbackUrl + (token ? '?token=' + token : '');
            });
        };

        $scope.sendPayment = function(customer, payment, product) {
            $scope.isLoading = true;
            $scope.paymentError = false;

            checkCustomer(customer, function(err) {
                if (err) return genericError();

                sendPayment(payment, product, function(err, paymentData) {
                    $scope.isLoading = false;
                    $scope.index += 1;

                    if (err) {
                        $scope.paymentError = true;
                        $scope.responseMessage = 'Ops...algo deu errado!';
                        $scope.responseText = 'Não foi possível concluir a contratação devido a algum problema relacionado ao método de pagamento. Por favor tente novamente.';
                        $scope.index = 6;
                        return;
                    }

                    if (paymentData.status === 'success') {
                        $scope.responseMessage = 'Parabéns, contratação realizada com sucesso!';
                        $scope.responseText = 'Você receberá por email a nota fiscal eletrônica desta contratação. Para dar continuidade '+
                                              'à criação de sua marca profissional acesse o Painel do Cliente e responda ao briefing inicial.';
                    } else if (paymentData.status === 'processing') {
                        $scope.responseMessage = 'Processo de contratação realizado!';
                        $scope.responseText = 'Acompanhe a atualização do status de pagamento pelo Painel do Cliente.';
                    }
                });
            });
        };

        $scope.tryAgain = function (paymentProfile) {
            $scope.paymentProfile = {
                'installments' : paymentProfile.installments
            };

            $scope.paymentForm.$setPristine();
            $scope.paymentForm.$setUntouched();
            $scope.index = 4;
        };

        $scope.selectCardImage = function(cardNumber) {
            $scope.imageCard = '';

            if (!cardNumber)
                return false;

            if (/^(4)/.test(cardNumber))
                $scope.imageCard = 'visa.png';
            else if (/^(51|52|53|54|55)/.test(cardNumber))
                $scope.imageCard = 'mastercard.png';
        };

        $scope.getCep =  function (cep, customer) {
            if (!cep || cep.length !== 8)
                return;

            $scope.isCepLoading = true;

            cepService.getCep(cep)
                .success(function (cepData) {
                    customer.address      = cepData.street;
                    customer.neighborhood = cepData.neighborhood;
                    customer.city         = cepData.city;
                    customer.state        = cepData.uf;
                    $scope.isCepLoading = false;
                })
                .error(function (reason) {
                    $scope.isCepLoading = false;
                    console.log(reason); // eslint-disable-line
                });
        };

        $scope.getInstallmentNumber = function(value) {
            var i = 1;
            var arr = [];

            for (i; i<= value; i++)
                arr.push(i);

            return arr;
        };

        $scope.prevStep = function(form) {
            $scope.index -= 1;

            if (form) {
                form.$setPristine();
                form.$setUntouched();
            }

            $scope.pwdAutoFocus = false;
            $scope.emailAutoFocus = false;
            $scope.cepAutoFocus = false;
            $scope.customerNameAutoFocus = false;
            $scope.paymentAutoFocus = false;
        };

        // MODAL FUNCS
        $scope.checkEmail = function(email, form) {
            if (form && form.$invalid) return;

            $scope.loginErrorMessage = false;
            $scope.isLoading = true;
            httpService.get('accounts', 'check-email', email)
                .success(function(data) {
                    if (data.alreadyExist)
                        $scope.createAccount = false;
                    else {
                        $scope.createAccount = true;
                        $scope.customer = null;
                        $scope.paymentProfile = null;
                    }

                    $scope.isLoading = false;
                    $scope.index += 1;

                    $scope.pwdAutoFocus = true;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line
                    $scope.isLoading = false;
                });

            loadZxcvbn(function(err) {
                if (err) console.log(err); // eslint-disable-line
            });
        };

        $scope.loginUser = function(user) {
            $scope.isLoading = true;
            $scope.loginErrorMessage = '';
            credentialsService.login({ 'usr' : user.email, 'pwd' : user.pwd})
                .then(function(credentialData) {
                    customersService.getCustomer(credentialData.customer_id)
                        .then(function(customer) {

                            if (!$scope.customer || $scope.customer._id !== credentialData.customer_id) {
                                $scope.customer = customerFactory.getCustomer(customer);
                                $scope.customer.cpfCnpj = customer.cpf || customer.cnpj;
                                $scope.paymentProfile = null;
                            }

                            delete $scope.login.pwd;
                            delete $scope.login.confPwd;
                            $scope.loginForm.$setPristine();
                            $scope.loginForm.$setUntouched();

                            $scope.isLoading = false;
                            $scope.index += 1;

                            $scope.customerNameAutoFocus = true;
                        }, function () {
                            $scope.isLoading = false;
                        });
                }, function (err) {
                    $scope.isLoading = false;
                    if (err.statusCode === 401)
                        $scope.loginErrorMessage = 'Senha inválida.';
                });
        };

        $scope.savePwd = function(user) {
            newCredential = {
                'email' : user.email,
                'pwd'   : user.pwd
            };
            delete $scope.login.pwd;
            delete $scope.login.confPwd;
            $scope.loginForm.$setPristine();
            $scope.loginForm.$setUntouched();
            delete $window.localStorage['PLING-TOKEN'];
            delete $window.localStorage['PLING-USER'];

            $scope.customerNameFocus = true;
        };

        $scope.clearInputs =  function () {
            delete $scope.login.pwd;
            delete $scope.login.confPwd;

            if ($scope.paymentForm) {
                $scope.paymentForm.$setPristine();
                $scope.paymentForm.$setUntouched();
            }

            if ($scope.customerComplementForm) {
                $scope.customerComplementForm.$setPristine();
                $scope.customerComplementForm.$setUntouched();
            }

            if ($scope.customerForm) {
                $scope.customerForm.$setPristine();
                $scope.customerForm.$setUntouched();
            }

            if ($scope.loginForm) {
                $scope.loginForm.$setPristine();
                $scope.loginForm.$setUntouched();
            }

        };

        $scope.submitLoginForm = function(form, login) {
            if (!form || form.$invalid || login.pwd !== login.confPwd && $scope.createAccount) return;

            if ($scope.createAccount) {
                $scope.savePwd(login);
                $scope.index += 1;
            } else {
                $scope.loginUser(login);
            }
        };

        $scope.formSimpleSubmit = function(form) {
            if (!form || form.$invalid) return;

            switch (form.$name) {
                case 'customerForm' :
                    $scope.cepAutoFocus = true;
                    break;
                case 'customerComplementForm' :
                    $scope.paymentAutoFocus = true;
                    break;
            }

            $scope.index += 1;
        };

        $scope.close = function() {
            closeModal();
        };

        (function init() {
            $scope.index = 0;
            $scope.customer = {};
            $scope.states = stateService.getStates();
            $scope.steps = [ 'Dados básicos', 'Dados Complementares', 'Pagamento', 'Finalizar'];

            $scope.isLoading = true;

            // get product(marca profissional) info
            getProduct('plingSiteApp', function(err, productData) {
                if (err) return genericError();

                $scope.product = productData;

                $scope.isLoading = false;

                $scope.emailAutoFocus = true;
            });

            $scope.paymentProfile = {};

            getClassifications();

        }());
    }

}());