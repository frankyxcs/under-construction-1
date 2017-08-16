(function () {
    'use strict';

    // Module dependencies injection
    angular.module('plingSiteApp', [
        'plingUiLite',
        'plingSiteApp.templates',
        'ngRoute',
        'angular-carousel',
        'ui.mask',
        'ui.utils.masks'
    ])

        .config(function ($compileProvider) {

            // Remove Angular Debugger to improve performance
            $compileProvider.debugInfoEnabled(false);
        });

}());

(function () {
    'use strict';

    // injecting dependencies
    MainController.$inject = [
        '$scope', '$rootScope', '$timeout',
        '$location', '$window', 'coreApiService',
        'httpHelperService', 'modalService'
    ];

    // registering on angular
    angular.module('plingSiteApp').controller('MainController', MainController);

    // Main Controller
    function MainController($scope, $rootScope, $timeout, $location, $window, core, httpHelperService, modalService) {

        // store the url to redirect later in case the user comes from other domain
        $rootScope.isAppLoaded  = false;
        $rootScope.loadingLayer = false;
        $rootScope.isAppLoading = true;

        $rootScope.openContactModal = function() {

            modalService.showModal({
                'templateUrl' : 'contato.html',
                'controller'  : 'ContatoController'
            }).then(function(modal) {
                modal.show();
                $scope.isDisabledHire = true;
                modal.closed.then(function() {
                    $scope.isDisabledHire = false;
                });
            });
        };

        // Route change
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.isAppLoading = true;
            $rootScope.showUserCreateButton = false;
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.isAppLoading = false;
        });

        // Registring Logout
        $rootScope.$on('PLING-SERVICE-BAR-LOGOUT', function () {
            core.redirectToLoginWithCallback();
        });

        $rootScope.$on('PLING-REDIRECT', function (event, url) {
            $rootScope.isAppLoaded = false;
            $window.location.href = url;
        });

        $rootScope.$on('CANCEL-REQUESTS', function () {
            httpHelperService.cancelRequest();
        });

        $rootScope.goTo = function (path) {
            if ($location.$$path === path) return;
            $location.path(path);
        };

    }
}());

(function () {
    'use strict';

    angular.module('plingSiteApp').config(['$routeProvider', '$locationProvider', AppRouter]);

    function AppRouter($routeProvider, $locationProvider) {

        $routeProvider

            .when('/', {
                'templateUrl'    : 'app/components/home/home.html',
                'controller'     : 'HomeController',
                'reloadOnSearch' : false
            })

            .when('/compromisso-social', {
                'templateUrl'    : 'app/components/compromisso/compromisso.html',
                'reloadOnSearch' : false
            })

            .when('/quem-somos', {
                'templateUrl'    : 'app/components/quem-somos/quemsomos.html',
                'reloadOnSearch' : false
            })

            .otherwise({
                'redirectTo': '/'
            });

        $locationProvider.html5Mode(true);

    }
}());

(function() {

    'use strict';

    HomeController.$inject = [ '$rootScope', '$scope', '$location', 'httpService', '$localstorage', '$window', 'coreApiService', 'modalService' ];

    angular.module('plingSiteApp').controller('HomeController', HomeController);

    function HomeController($rootScope, $scope, $location, httpService, $localstorage, $window, core, modalService) {

        function findMediaLink() {
            var medias = core.getSocialMedia();
            var currentBusiness = core.getCurrentBusiness();

            $rootScope.medias = {
                'facebook' : medias.facebook[currentBusiness],
                'twitter' : medias.twitter[currentBusiness]
            };
        }

        function getWorks(cb) {
            var items, works = [];

            httpService.get('accounts', 'customers/works', '?business=' + core.getCurrentBusiness())
                .success(function(data) {
                    while (data.length > 12) {

                        items = data.splice(0, 12).map(function(item) {
                            var testimony = item.testimony.find(function(r) {
                                return r.site_name && r.site_name.indexOf('Marca') >= 0;
                            });

                            var mockup = testimony.files.find(function(t) {
                                return t.type === 'small';
                            });

                            item.imageUrl = 'https://s3.amazonaws.com/pling-customers/' + item.associated_customer._id + '/ticket-files/' + mockup._id;

                            return item;
                        });

                        works.push(items);
                    }
                    cb(null, works);
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line
                    cb(reason);
                });
        }

        $scope.playVideo = function() {
            $('#videoModal').modal('show');
            $scope.showVideo = true;
        };

        $scope.closeVideo = function() {
            $('#videoModal').modal('hide');
            $scope.showVideo = false;
        };

        $scope.workDetails = function(item) {
            $location.path('/marca/trabalhos/' + item._id);
        };

        $scope.openModal = function() {
            if ($scope.isDisabledHire) return;

            modalService.showModal({
                'templateUrl' : 'criar-conta.html',
                'controller'  : 'CriarContaController'
            }).then(function(modal) {
                modal.show();
                $scope.isDisabledHire = true;
                modal.closed.then(function() {
                    $scope.isDisabledHire = false;
                });
            });
        };

        $rootScope.isAppLoaded = true;

        (function init() {
            var env = $localstorage.get('PLING-CURRENT-ENV');

            $rootScope.isAppLoaded = true;
            $scope.carouselIndex = 0;

            httpService
                .get('accounts', 'products/Login/' + env)
                .success(function(urlData) {
                    $rootScope.loginUrl =  urlData.callbackUrl;
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line
                });

            delete $window.localStorage['PLING-TOKEN'];
            delete $window.localStorage['PLING-APPS'];
            delete $window.localStorage['PLING-USER'];

            findMediaLink();

            $scope.carouselLoading = true;
            getWorks(function(err, data) {
                $scope.carouselLoading = false;

                $scope.worksBlock = data || [];
            });

        }());

    }

}());
(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('navBar', NavBar);

    NavBar.$inject = [ '$location', 'coreApiService' ];

    function NavBar($location, coreApiService) {
        return {
            'restict' : 'E',
            'templateUrl': 'app/components/nav-bar/nav.html',
            'link'    : function(scope) {
                var medias = coreApiService.getSocialMedia();

                scope.medias = {
                    'facebook' : medias.facebook['general'],
                    'twitter' : medias.twitter['general']
                };
                scope.goTo = function (path) {
                    if ($location.$$path === path) return;
                    $location.path(path);
                };
            }
        };
    }

}());
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
(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .service('socialMediaService', SocialMediaService);

    SocialMediaService.$inject = [ 'httpService', '$location', 'coreApiService' ];

    function SocialMediaService(httpService, $location, core) {

        this.newFacebookPost = function(title, imageUrl, cb) {
            var query = 'https://www.facebook.com/dialog/feed?';

            var link = $location.host() === 'localhost' ? 'http://mercados-dev.pling.net.br' + $location.path() : $location.absUrl();

            query += 'app_id=926595427425114' +
                      '&link=' + link +
                      '&picture=' + imageUrl +
                      '&name=' + title +
                      '&redirect_uri' + link;

            return cb(null, query);
        };

        this.newTwitterTweet = function(description, ticket_id) {
            var coreUrl = core.getAppCoreUrl(), link, query;

            if (coreUrl.indexOf('localhost') >= 0)
                coreUrl = 'http://api-dev.pling.net.br:5000/api/v1';

            link = coreUrl + '/presenca-social/testimony/' + ticket_id;

            query = 'https://twitter.com/share';

            query += '?url=' + link +
                     '&text=' + description;

            return query;
        };
    }

}());
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
(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('cardValidator', CardValidator);

    CardValidator.$inject = [ 'cardValidatorService' ];

    function CardValidator(cardValidatorService) {
        return {
            'restict' : 'A',
            'require' : 'ngModel',
            'link'    : function(scope, elem, attrs, ngModel) {
                ngModel.$validators[attrs.cardValidator] = function(modelValue) {
                    var value = modelValue;

                    if (!value) return false;

                    if (attrs.cardValidator === 'number')
                        return cardValidatorService.validateCardNumber(value).isValid;
                    else if (attrs.cardValidator === 'date') {
                        if (value.length < 4)
                            return false;

                        value = value.substr(0, 2) + value.substr(value.length-2, 2);

                        return cardValidatorService.validateDate(value).isValid;
                    } else
                        return false;
                };
            }
        };
    }

}());
(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('keyEnter', KeyEnterDirective);

    KeyEnterDirective.$inject = [ '$timeout' ];

    function KeyEnterDirective($timeout) {
        return {
            'restrict' : 'A',
            'link'     : function(scope, elem, attrs) {

                elem.bind('keydown', function(event) {
                    if (event.keyCode === 13) {
                        $timeout(function() {
                            scope.$eval(attrs.keyEnter);
                        });
                    }
                });
            }
        };
    }

}());
(function() {
    'use strict';

    navBarAnimationDirective.$inject = [];

    angular.module('plingSiteApp').directive('navbarAnimation', navBarAnimationDirective);

    function navBarAnimationDirective () {
        return {
            'link' : function(event, element) {

                var topScroll = 0;

                // jQuery for page scrolling feature - requires jQuery Easing plugin
                $(function() {
                    $('body').on('click', 'a.page-scroll', function(event) {
                        var $anchor = $(event.currentTarget);

                        if ($($anchor.attr('href')).length > 0)
                            $('html, body').stop().animate({
                                'scrollTop': $($anchor.attr('href')).offset().top
                            }, 800);

                        event.preventDefault();
                    });
                });

                // Closes the Responsive Menu on Menu Item Click
                $('.navbar-collapse ul li a').click(function() {
                    if ($('.navbar-collapse').hasClass('in'))
                        $(this).closest('.collapse').collapse('toggle');
                });

                // Change background menu
                $(document).scroll(function() {
                    if ($(this).scrollTop() > topScroll) {
                        $(element).addClass('fixednav');
                    } else {
                        $(element).removeClass('fixednav');
                    }
                });

                (function() {
                    if ($(document).scrollTop() > topScroll) {
                        $(element).addClass('fixednav');
                    } else {
                        $(element).removeClass('fixednav');
                    }
                }());

            }
        };
    }

}());
(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('openNewTab', openNewTabDirective);

    function openNewTabDirective() {
        return {
            'restrict' : 'A',
            'link': function (scope, element, attrs) {
                element.bind('click', function () {
                    var win = window.open(attrs.openNewTab, '_blank');

                    win.focus();
                });
            }
        };
    }

}());

(function () {

    plgAutoFocusDirective.$inject = [ '$timeout' ];

    angular
        .module('plingSiteApp')
        .directive('plgAutoFocus', plgAutoFocusDirective);

    function plgAutoFocusDirective ($timeout) {
        return {
            'restrict' : 'A',
            'link': function (scope, element, attrs) {
                scope.$watch(attrs.plgAutoFocus, function(newValue) {
                    if (newValue)
                        $timeout(function() {
                            element[0].focus();
                        });
                });
            }
        };
    }

}());
(function () {
    'use strict';

    angular.module('plingSiteApp')
        .factory('modalService', ModalFactory);

    ModalFactory.$inject = ['$animate', '$document', '$compile', '$controller', '$http', '$rootScope', '$q', '$templateRequest', '$timeout' ];

    function ModalFactory($animate, $document, $compile, $controller, $http, $rootScope, $q, $templateRequest, $timeout) {

        function ModalService() {
            var self = this;

            //  Returns a promise which gets the template, either
            //  from the template parameter or via a request to the
            //  template url parameter.
            function getTemplate(template, templateUrl) {
                var deferred = $q.defer();

                $templateRequest('modal-template.html', true)
                    .then(function(basicTemplate) {
                        if (template) {
                            deferred.resolve(basicTemplate.replace('{{modalTemplate}}', template));
                        } else if (templateUrl) {
                            $templateRequest(templateUrl, true)
                            .then(function(template) {
                                deferred.resolve(basicTemplate.replace('{{modalTemplate}}', template));
                            }, function(error) {
                                deferred.reject(error);
                            });
                        } else {
                            deferred.reject('No template or templateUrl has been specified.');
                        }
                    }, function(error) {
                        deferred.reject(error);
                    });

                return deferred.promise;
            }

            //  Adds an element to the DOM as the last child of its container
            //  like append, but uses $animate to handle animations. Returns a
            //  promise that is resolved once all animation is complete.
            function appendChild(parent, child) {
                var children = parent.children();

                if (children.length > 0) {
                    return $animate.enter(child, parent, children[children.length - 1]);
                }
                return $animate.enter(child, parent);
            }

            self.showModal = function(options) {
                var deferred = $q.defer();
                // Get the body of the document, we'll add the modal to this.
                var body = angular.element($document[0].body);

                //  Validate the input parameters.
                var controllerName = options.controller;

                if (!controllerName) {
                    deferred.reject('No controller has been specified.');
                    return deferred.promise;
                }

                //  Get the actual html of the template.
                getTemplate(options.template, options.templateUrl)
                    .then(function(template) {
                        var linkFn, modalElement, controllerObjBefore, modalController, modal;

                    //  Create a new scope for the modal.
                        var modalScope = (options.scope || $rootScope).$new();
                        var rootScopeOnClose = $rootScope.$on('$locationChangeSuccess', cleanUpClose);

                    //  Create the inputs object to the controller - this will include
                    //  the scope, as well as all inputs provided.
                    //  We will also create a deferred that is resolved with a provided
                    //  close function. The controller can then call 'close(result)'.
                    //  The controller can also provide a delay for closing - this is
                    //  helpful if there are closing animations which must finish first.
                        var closeDeferred = $q.defer();
                        var closedDeferred = $q.defer();
                        var inputs = {
                            '$scope': modalScope,
                            'closeModal' : function(result, delay) {
                                modalScope.showModal = false;
                                if (!delay) delay = 0; // eslint-disable-line
                                $timeout(function() {
                                    cleanUpClose(result);
                                }, delay);
                            }
                        };

                        //  If we have provided any inputs, pass them to the controller.
                        if (options.inputs) angular.extend(inputs, options.inputs);

                        //  Compile then link the template element, building the actual element.
                        //  Set the $element on the inputs so that it can be injected if required.
                        linkFn = $compile(template);
                        modalElement = linkFn(modalScope);

                        inputs.$element = modalElement;

                        //  Create the controller, explicitly specifying the scope to use.
                        controllerObjBefore = modalScope[options.controllerAs];
                        modalController = $controller(options.controller, inputs, false, options.controllerAs);

                        if (options.controllerAs && controllerObjBefore) {
                            angular.extend(modalController, controllerObjBefore);
                        }

                        //  Then, append the modal to the dom.
                        if (options.appendElement) {
                            // append to custom append element
                            appendChild(options.appendElement, modalElement);
                        } else {
                            // append to body when no custom append element is specified
                            appendChild(body, modalElement);
                        }

                        // Finally, append any custom classes to the body
                        if (options.bodyClass) {
                            body[0].classList.add(options.bodyClass);
                        }

                        //  We now have a modal object...
                        modal = {
                            'controller' : modalController,
                            'scope' : modalScope,
                            'element' : modalElement,
                            'close' : closeDeferred.promise,
                            'closed' : closedDeferred.promise,
                            'show'   : function () {
                                $timeout(function() {
                                    modalScope.showModal = true;
                                });
                            }
                        };

                        //  ...which is passed to the caller via the promise.
                        deferred.resolve(modal);

                        function cleanUpClose(result) {

                            //  Resolve the 'close' promise.
                            closeDeferred.resolve(result);

                            //  Remove the custom class from the body
                            if (options.bodyClass) {
                                body[0].classList.remove(options.bodyClass);
                            }

                            //  Let angular remove the element and wait for animations to finish.
                            $animate.leave(modalElement)
                                    .then(function () {
                                        //  Resolve the 'closed' promise.
                                        closedDeferred.resolve(result);

                                        //  We can now clean up the scope
                                        modalScope.$destroy();

                                        //  Unless we null out all of these objects we seem to suffer
                                        //  from memory leaks, if anyone can explain why then I'd
                                        //  be very interested to know.
                                        inputs.close = null;
                                        deferred = null;
                                        closeDeferred = null;
                                        modal = null;
                                        inputs = null;
                                        modalElement = null;
                                        modalScope = null;
                                    });

                            // remove event watcher
                            rootScopeOnClose && rootScopeOnClose();
                        }

                    })
                    .then(null, function(error) {
                        // 'catch' doesn't work in IE8.
                        deferred.reject(error);
                    });

                return deferred.promise;
            };

        }

        return new ModalService();
    }
}());
(function () {

    angular.module('plingSiteApp')
        .directive('carouselDirective', CarouselDirectice);

    CarouselDirectice.$inject = [];

    function CarouselDirectice() {

        function onLink(scope) {

            scope.nextSlide = function(carouselIndex) {
                if (carouselIndex < 3)
                    scope.carouselIndex += 1;
            };

            scope.prevSlide = function(carouselIndex) {
                if (carouselIndex > 0)
                    scope.carouselIndex -= 1;
            };

            scope.clickCallback = function(item) {
                if (scope.carouselClick)
                    scope.carouselClick(item);
            };

        }

        return {
            'restrict' : 'E',
            'link' : onLink,
            'scope' : {
                'items' : '=',
                'carouselClick' : '=',
                'isLoading' : '='
            },
            'templateUrl' : 'carousel.html'
        };
    }

}());
(function() {
    'use strict';

    angular
        .module('plingSiteApp')
        .directive('mdButton', MdButtonDirective);

    MdButtonDirective.$inject = [];

    function MdButtonDirective() {
        return {
            'restrict' : 'A',
            'link'     : function(scope, elem, attrs) {
                var raw = elem[0];

                $(raw).addClass('md-button md-primary');

                $(raw).on('click', function(e) {
                    var x, y, c, clickX, clickY, box, setX, setY, ripple;

                    if (attrs.disabled)
                        return;

                    x      = e.pageX;
                    y      = e.pageY;
                    clickY = y - $(this).offset().top;
                    clickX = x - $(this).offset().left;
                    box    = this;

                    setX   = parseInt(clickX); // eslint-disable-line
                    setY   = parseInt(clickY); // eslint-disable-line
                    ripple = '<svg class="ink"> \ <circle cx="' + setX + '" cy="' + setY + '" r="' + 0 + '"></circle> \ </svg>';

                    $(this).find('.ink').remove();
                    $(this).append(ripple);

                    c = $(box).find('circle');
                    c.animate({ 'r' : $(box).outerWidth() },
                        {
                            'duration' : 333,
                            'step'     : function(val) { c.attr('r', val); },
                            'complete' : function() { c.fadeOut('fast'); }
                        });

                    return true;

                });
            }
        };
    }

}());
(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .directive('mdInput', MdInputDirective);

    MdInputDirective.$inject = [];

    function MdInputDirective() {
        return {
            'restrict' : 'A',
            'require' : ['ngModel'],
            'link'     : function(scope, elem, attrs, ctrls) {
                var input = $(elem[0]);
                var ngModelCtrl = ctrls[0];

                input.addClass('input-item');
                $('<label>' + attrs.mdInput + '</label><span class="bar"></span>').insertAfter(input);

                scope.$watch(attrs.ngModel, function(value) {
                    if (value)
                        input.addClass('hasValue');
                    else
                        input.removeClass('hasValue');
                });

                input.on('input keydown keyup', function() {
                    if (ngModelCtrl.$viewValue)
                        input.addClass('hasValue');
                    else
                        input.removeClass('hasValue');
                });

                if (attrs.placeholder)
                    input.addClass('hasValue');
            }
        };
    }

}());
(function () {
    'use strict';

    angular
        .module('plingSiteApp')
        .factory('zxcvbnFactory', zxcvbnFactory);

    function zxcvbnFactory() {
        return {
            'score': function() {
                if (typeof zxcvbn === 'undefined')
                    return false;

                var compute = zxcvbn.apply(null, arguments); //eslint-disable-line

                return compute && compute.score;
            }
        };
    }

    plgPasswordStrength.$inject = [ 'zxcvbnFactory' ];
    angular.module('plingSiteApp').directive('plgPasswordStrength', plgPasswordStrength);

    function plgPasswordStrength(zxcvbnFactory) {
        return {
            'restrict': 'E',
            'scope' : {
                'password' : '='
            },
            'templateUrl' : 'password-strength.html',
            'link': function($scope) {
                $scope.$watch('password', function(password) {
                    $scope.passwordStrength = password ? password.length > 6 && zxcvbnFactory.score(password) || 0 : null;
                }, true);
            }
        };
    }

})();
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

(function() {

    'use strict';

    ContatoController.$inject = [ '$scope', 'contatoService', 'closeModal' ];

    angular.module('plingSiteApp').controller('ContatoController', ContatoController);

    function ContatoController($scope, contatoService, closeModal) {

        $scope.close = function() {
            closeModal();
        };

        $scope.send = function() {
            contatoService.post($scope.info, function (err) {
                if (err) return console.log(err);
                closeModal();
            });
        };

        (function init() {

        }());
    }

}());
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
(function() {

    'use strict';

    angular
        .module('plingSiteApp')
        .controller('EmailController', EmailController);

    EmailController.$inject = [ '$scope', '$rootScope', '$routeParams', 'httpService', 'closeModal', '$timeout' ];

    function EmailController($scope, $rootScope, $routeParams, httpService, closeModal) {

        $scope.sendEmail = function(config) {
            $scope.isLoading = true;

            httpService.post('accounts', 'customers/works/' + $routeParams.id  + '/email', config)
                .success(function() {
                    $scope.isLoading = false;
                    $rootScope.$broadcast('TOAST-ACTION', { 'message' : 'Email enciado com sucesso.', 'cb' : function () {} });
                    closeModal();
                })
                .error(function(reason) {
                    console.log(reason); // eslint-disable-line

                    if (reason && reason.statusCode === 400)
                        $rootScope.$broadcast('TOAST-ACTION', { 'message' : 'Destinatário inexistente: ' + reason.message, 'cb' : function () {} });

                    $scope.isLoading = false;
                });
        };

        $scope.close = function() {
            closeModal();
        };
    }

}());
angular.module('plingSiteApp.templates', []).run(['$templateCache', function($templateCache) {$templateCache.put('compromisso.html','<section id=compromisso class="lg-container know-more"><div class="container text-center"><h2 class=header-text>Compromisso social</h2><p class=intro-text>N\xF3s realmente acreditamos que podemos contribuir para um mundo melhor. Um pouco pela nossa pr\xF3pria contribui\xE7\xE3o mensal, um pouco pela contribui\xE7\xE3o de nossos clientes e, principalmente, pelo exemplo que podemos dar para que outras empresas fa\xE7am o mesmo. E tamb\xE9m acreditamos que o M\xE9dico Sem Fronteiras \xE9 o destino ideal de nossos esfor\xE7os.</p></div></section><section class="lg-container top" style="background-color: #356fa2; color: white;"><div class="container text-center"><h2>10 fatos relevantes em rela\xE7\xE3o ao nosso compromisso social.</h2><div class=row><ul class="inline-block width-half text-white"><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">1</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">2</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">3</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">4</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">5</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li></ul><ul class="inline-block width-half text-white"><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">6</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">7</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">8</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">9</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li><li class="bottom-space text-left"><div class="btn btn-rectangle big-circle no-margin">10</div><h5 class=inline-block>Titulo</h5><p class="no-margin small-font margin-35-60">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></li></ul></div></div></section><section class="lg-container know-more"><div class="container text-center"><h2 class=header-text>Como funciona</h2><p class=intro-text>Quando nossos clientes contratam algum de nossos servi\xE7os, eles podem optar por doar at\xE9 3% do valor bruto do contrato para o MSF. N\xF3s, da PLING, doamos o mesmo valor do cliente, independente da nossa doa\xE7\xE3o mensal fixa.</p></div></section><section class="lg-container know-more" style="background: #356fa2"><div class="container text-center"><h2 class=header-text>Acompanhe nossas doa\xE7\xF5es.</h2><p class=intro-text>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p></div></section>');
$templateCache.put('home.html','<header id=inicio class="intro quem-somos"><div class=container><div class=row><div class="col-md-offset-2 col-md-8 text-center"><h2>Quem Somos</h2><p>Somos um time de pessoas apaixonadas pelo que fazemos. Nossos clientes s\xE3o nossa inspira\xE7\xE3o e raz\xE3o de existir. \xC9 exatamente por isso que ocupam o posto principal em nosso organograma. Nossa miss\xE3o \xE9 fornecer solu\xE7\xF5es que efetivamente tenham impacto em suas vidas profissionais. N\xE3o nos contentamos com o bom porque buscamos a excel\xEAncia. N\xF3s somos a PLING!</p></div></div></div></header><section id=compromisso class="lg-container know-more"><div class="container text-center"><h1 class=header-text>N\xF3s apoiamos M\xE9dicos Sem Fronteiras. Junte-se a n\xF3s nesta miss\xE3o.</h1><p class=intro-text>Acreditamos que podemos construir um mundo melhor. Fazemos isso pela nossa contribui\xE7\xE3o mensal, incentivando que nossos clientes tamb\xE9m contribuam mas, principalmente, dando o exemplo para que outras empresas fa\xE7am o mesmo. Escolhemos M\xE9dicos Sem Fronteiras como destino de nossos esfor\xE7os. Sempre que um cliente contrata nossos servi\xE7os, ele pode optar por doar at\xE9 3% do valor para o M\xE9dicos Sem Fronteiras. N\xF3s, da PLING, doaremos o mesmo valor do cliente al\xE9m da doa\xE7\xE3o que j\xE1 fazemos mensalmente.</p><a class="btn btn-rectangle page-scroll" href=#compromisso open-new-tab="https://www.msf.org.br/">Saiba mais</a> <a class="btn btn-rectangle page-scroll" open-new-tab=https://www.msf.org.br/doador-sem-fronteiras style="margin-left: 22px;">Doe agora</a></div></section><section id=contato class="lg-container fundo-pling"><div class=container style="top:0 !important;"><div class=row><div class="col-md-12 text-center"><p class=intro-text style="color: #fff!important;font-size: 26px">Nossas solu\xE7\xF5es adotam as mais modernas tecnologias de computa\xE7\xE3o na nuvem e s\xE3o ofertadas para todo o Brasil e alguns pa\xEDses do Mercosul. Apesar deste posicionamento estrat\xE9gico predominantemente virtual, somos uma empresa s\xF3lida pertencente a um grupo empresarial com fortes raizes no sul do Brasil. Esta \xE9 nossa sede. Nosso CNPJ \xE9 24.289.657/0001\xAD89. Nosso CEO \xE9 o Paulo Esteves Filho. Estamos localizados na cidade de Porto Alegre/RS, na Av. Dr. Carlos Barbosa, 68, Bairro Medianeira.</p><a class="btn btn-rectangle page-scroll" ng-click=openContactModal()>Fale conosco</a></div></div></div></section>');
$templateCache.put('nav.html','<nav class="navbar navbar-custom navbar-fixed-top" role=navigation navbar-animation=""><div class="container container-nav"><div class=navbar-header><button type=button class=navbar-toggle data-toggle=collapse data-target=.navbar-main-collapse>Menu <i class="fa fa-bars"></i></button> <a class="navbar-brand logo-pling page-scroll" href=#home ng-click="goTo(\'/\')"><img src=dist/assets/img/logo_pling_site.jpg></a></div><div class="collapse navbar-collapse navbar-right navbar-main-collapse"><ul class="nav navbar-nav"><li><a class=page-scroll href=#compromisso>Compromisso social</a></li><li><a class=page-scroll href=#sobre>Quem somos</a></li><li><a class=page-scroll href=#trabalhe>Trabalhe conosco</a></li><li><div class="media-link color"><a class="navbar-brand logo-facebook" ng-href={{medias.facebook}} target=_blank><img src=dist/assets/img/logo_facebook.jpg></a> <a class="navbar-brand logo-twitter" ng-href={{medias.twitter}} target=_blank><img src=dist/assets/img/logo_twitter.png></a></div><div class="media-link white"><a class="navbar-brand logo-facebook" ng-href={{medias.facebook}} target=_blank><img src=dist/assets/img/logo_facebook_white.png></a> <a class="navbar-brand logo-twitter" ng-href={{medias.twitter}} target=_blank><img src=dist/assets/img/logo_twitter_white.png></a></div></li></ul></div></div></nav>');
$templateCache.put('quemsomos.html','<header id=inicio class="intro quem-somos"><div class=container><div class=row><div class="col-md-12 text-center"><h2>Miss\xE3o</h2><p style="font-size: 20px !important">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque laoreet velit, ut viverra eros condimentum eget. Nunc malesuada magna ante, in egestas elit molestie et.</p><h2>Vis\xE3o</h2><p style="font-size: 20px !important">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque laoreet velit, ut viverra eros condimentum eget. Nunc malesuada magna ante, in egestas elit molestie et.</p><h2>Valores</h2><p style="font-size: 20px !important">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque laoreet velit, ut viverra eros condimentum eget. Nunc malesuada magna ante, in egestas elit molestie et.</p></div></div></div></header>');
$templateCache.put('carousel.html','<div class=carousel-block><div ng-show=isLoading class=loader><div class=general-loader><div class=comment-icon><i class=dit></i> <i class=dit></i> <i class=dit></i></div></div></div><ul rn-carousel="" rn-carousel-index=carouselIndex ng-hide=isLoading><li ng-repeat="item in items"><div class=grid-block-container><div class=grid-block ng-repeat="block in item track by $index" ng-click=clickCallback(block) ng-class="{\'block-border-right\': (($index+1) % 4 > 0), \'block-border-bottom\': $index < 8}"><img src={{block.imageUrl}}></div></div></li></ul><div class=controls-block ng-hide=isLoading><svg ng-click=prevSlide(carouselIndex); class=prev fill=#000000 height=24 viewbox="0 0 24 24" width=24 xmlns=http://www.w3.org/2000/svg><path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"></path><path d=M0-.5h24v24H0z fill=none></path></svg><svg ng-click=nextSlide(carouselIndex); class=next fill=#000000 height=24 viewbox="0 0 24 24" width=24 xmlns=http://www.w3.org/2000/svg><path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"></path><path d=M0-.25h24v24H0z fill=none></path></svg></div></div>');
$templateCache.put('password-strength.html','<div class=plg-strength-meter-container><div class=plg-strength-meter><div class=plg-strength-meter-fill data-strength={{passwordStrength}}></div></div></div>');
$templateCache.put('modal-template.html','<div id=somedialog class="dialog dialog--close" ng-class="{\'dialog--open\' : showModal}"><div class=dialog__overlay></div><div class=dialog__content><div class=morph-shape><svg xmlns=http://www.w3.org/2000/svg width=100% height=100% viewbox="0 0 560 280" preserveaspectratio=none><rect x=3 y=3 fill=none width=556 height=276></rect></svg></div><span class=close-btn ng-click="close(\'false\')"></span><div class=dialog-body>{{modalTemplate}}</div></div></div>');
$templateCache.put('contato.html','<div class=dialog-inner><div ng-show=isLoading class=loader><div class=general-loader><div class=comment-icon><i class=dit></i> <i class=dit></i> <i class=dit></i></div></div></div><div class=steps ng-hide=isLoading><form name=emailForm novalidate="" style="width: 560px;" autocomplete=off><h2>Fale conosco</h2><div class=form-container ng-init="emailAutoFocus = true;"><div class=row><div class="col-md-offset-2 col-md-8"><div class=material-input><input md-input=Nome name=name type=text ng-model=info.name required="" autocomplete=off plg-auto-focus=emailAutoFocus></div><div class=material-input><input md-input=Email name=email type=email ng-model=info.email required="" autocomplete=off><p class="input-error help-block" ng-show="emailForm.email.$error.required && emailForm.email.$touched">Campo obrigat\xF3rio.</p><p class="input-error help-block" ng-show="emailForm.email.$error.email && emailForm.email.$touched">Email inv\xE1lido.</p></div><div class=material-input><textarea md-input=Descri\xE7\xE3o name=description type=text ng-model=info.description required="" autocomplete=off maxlength=160></textarea></div></div></div></div></form></div></div><div class=dialog-footer><button type=button md-button="" ng-click=close();>Cancelar</button> <button type=button class="md-button md-primary" ng-click=send(); ng-disabled="emailForm.email.$error.required || emailForm.name.$error.required || emailForm.description.$error.required">Enviar</button></div>');
$templateCache.put('criar-conta.html','<div class=dialog-inner><div ng-show=isLoading class=loader><div class=general-loader><div class=comment-icon><i class=dit></i> <i class=dit></i> <i class=dit></i></div></div></div><div class=steps ng-hide=isLoading><form name=emailForm key-enter="checkEmail(login.email, emailForm);" novalidate="" ng-show="index === 0" style="width: 560px;"><h2>Informe seu email</h2><p class=info>Ele ser\xE1 o seu login na PLING para acompanhar, via Painel do Cliente, o andamento de sua contrata\xE7\xE3o. Se voc\xEA j\xE1 participa da PLING, informe seu login.</p><div class=form-container><div class=row><div class="col-md-offset-2 col-md-8"><div class=material-input><input md-input="Seu email" name=email type=email ng-model=login.email required="" autocomplete=off plg-auto-focus=emailAutoFocus><p class="input-error help-block" ng-show="emailForm.email.$error.required && emailForm.email.$touched">Campo obrigat\xF3rio.</p><p class="input-error help-block" ng-show="emailForm.email.$error.email && emailForm.email.$touched">Email inv\xE1lido.</p></div></div></div></div></form><form name=loginForm key-enter="submitLoginForm(loginForm, login)" novalidate="" ng-show="index === 1" style="width: 560px;"><h2>{{ createAccount ? \'Crie sua senha\' : \'Informe sua senha\'}}</h2><p ng-if=!createAccount class=info>Identificamos que voc\xEA j\xE1 \xE9 um usu\xE1rio da PLING. Informe sua senha para prosseguirmos.</p><p ng-if=createAccount class=info>Ela deve conter no m\xEDnimo 6 caracteres, misturando letras e n\xFAmeros</p><div class=form-container><div class=row><div ng-class="{\'col-md-offset-2 col-md-4\' : createAccount, \'col-md-offset-3 col-md-6\' : !createAccount}"><div class=material-input ng-if=createAccount><input md-input="Sua senha" type=password name=pwd ng-model=login.pwd required="" ng-pattern="/(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])*[A-Za-z\\d$@$!%*#?&]{6,20}/" plg-auto-focus=pwdAutoFocus><plg-password-strength password=login.pwd></plg-password-strength></div><div class=material-input ng-if=!createAccount><input md-input="Sua senha" type=password name=pwd ng-model=login.pwd required="" plg-auto-focus=pwdAutoFocus></div></div><div class="col-md-offset-1 col-md-4" ng-if=createAccount><div class=material-input><input md-input="Confirme sua senha" type=password name=confPwd ng-model=login.confPwd required="" ng-pattern="/(?=.*[A-Za-z])(?=.*\\d)(?=.*[$@$!%*#?&])*[A-Za-z\\d$@$!%*#?&]{6,20}/"></div></div></div><div class="row inline-err" ng-class="{\'inline-err-pass\' : createAccount}"><p ng-class="{\'col-md-offset-2\' : createAccount, \'col-md-offset-3\' : !createAccount}" style="padding-left: 5px;"></p><p class=input-error ng-show="createAccount && loginForm.pwd.$invalid && !loginForm.pwd.$pristine && loginForm.pwd.$touched">Sua senha deve conter no m\xEDnimo 6 caracteres, misturando letras e n\xFAmeros.</p><p class=input-error ng-show=loginErrorMessage>Esta senha n\xE3o corresponde ao login informado.</p><p class=input-error ng-show="login.pwd !== login.confPwd && loginForm.confPwd.$touched && !loginForm.pwd.$invalid">Senhas informadas n\xE3o conferem.</p></div></div></form><form name=customerForm key-enter=formSimpleSubmit(customerForm); novalidate="" ng-show="index === 2" style="width: 720px"><h2>Dados b\xE1sicos</h2><p ng-if=!customer._id class=info>Estas informa\xE7\xF5es s\xE3o necess\xE1rias para que possamos emitir a nota fiscal eletr\xF4nica da contrata\xE7\xE3o que est\xE1 sendo realizada.</p><p ng-if=customer._id class=info>Identificamos, pelo usu\xE1rio e senha informados, que voc\xEA j\xE1 possui uma conta ativa na PLING. Confirme seus dados ou corrija-os caso estejam equivocados.</p><div class=form-container><div class="row col-md-offset-1 col-md-10"><div class=col-md-12><div class=material-input><input md-input="Seu nome ou de sua empresa" type=text name=name plg-auto-focus=customerNameAutoFocus ng-model=customer.name ng-minlength=3 ng-maxlength=50 required=""><p class=input-error ng-show="customerForm.name.$invalid && customerForm.name.$touched">Campo obrigat\xF3rio ou M\xEDnimo de 3 e m\xE1ximo de 50 caracteres.</p></div></div></div><div class="row col-md-offset-1 col-md-10"><div class=col-md-4><div class=material-input><input md-input="Seu CPF ou CNPJ" type=text required="" name=cpfCnpj ng-model=customer.cpfCnpj ui-br-cpfcnpj-mask=""><p class=input-error ng-show="customerForm.cpfCnpj.$error.cpf && customerForm.cpfCnpj.$touched">CPF inv\xE1lido.</p><p class=input-error ng-show="customerForm.cpfCnpj.$error.cnpj && customerForm.cpfCnpj.$touched">CNPJ inv\xE1lido.</p><p class=input-error ng-show="customerForm.cpfCnpj.$error.required && customerForm.cpfCnpj.$touched">Campo obrigat\xF3rio.</p></div></div><div class=col-md-4><div class=material-input><input md-input="Seu telefone celular" name=phone ng-model=customer.phone ui-mask="(99) 9999-9999?9" ui-mask-placeholder="" ui-mask-placeholder-char="" placeholder="{{customerForm.phone.$viewValue ? \'_\' : \'\'}}" required=""><p class=input-error ng-show="customerForm.phone.$invalid && customerForm.phone.$touched">Campo obrigat\xF3rio.</p></div></div><div class=col-md-4><div class=material-input><input md-input="Telefone adicional" name=phoneTwo ng-model=customer.phoneTwo ui-mask="(99) 9999-9999?9" ui-mask-placeholder="" ui-mask-placeholder-char="" placeholder="{{customerForm.phoneTwo.$viewValue ? \'_\' : \'\'}}"></div></div></div></div></form><form name=customerComplementForm key-enter=formSimpleSubmit(customerComplementForm); novalidate="" ng-show="index === 3" style="width: 720px"><h2>Seu endere\xE7o</h2><p ng-if=!customer._id class=info>Estas informa\xE7\xF5es s\xE3o necess\xE1rias para que possamos emitir a nota fiscal eletr\xF4nica da contrata\xE7\xE3o que est\xE1 sendo realizada.</p><p ng-if=customer._id class=info>Identificamos, pelo usu\xE1rio e senha informados, que voc\xEA j\xE1 possui uma conta ativa na PLING. Confirme seus dados ou corrija-os caso estejam equivocados.</p><div class=form-container><div class=row><div class="col-md-offset-1 col-md-2"><div class=material-input><input md-input=CEP name=postalCode ng-model=customer.postalCode ng-change="getCep(customer.postalCode, customer)" plg-auto-focus=cepAutoFocus ui-mask=99999-999 ui-mask-placeholder="" ui-mask-placeholder-char="" placeholder="{{customerComplementForm.postalCode.$viewValue ? \'_\' : \'\'}}"><p class=input-error ng-show="customerComplementForm.postalCode.$invalid && customerComplementForm.postalCode.$touched">CEP inv\xE1lido.</p></div></div></div><div class=row><div class="col-md-offset-1 col-md-6"><div class=material-input><input md-input=Endere\xE7o type=text required="" name=address ng-model=customer.address ng-class="{\'input-loading\' : isCepLoading}"><p class=input-error ng-show="customerComplementForm.address.$invalid && !customerComplementForm.address.$pristine">Endere\xE7o incorreto.</p></div></div><div class=col-md-2><div class=material-input><input md-input=Numero name=number type=text ng-model=customer.addressNumber ui-mask=9?9?9?9?9?9?9?9 ui-mask-placeholder="" ui-mask-placeholder-char=space></div></div><div class=col-md-2><div class=material-input><input md-input=Complemento name=addressComplement ng-model=customer.addressComplement></div></div></div><div class=row><div class="col-md-offset-1 col-md-3"><div class=material-input><input md-input=Bairro required="" name=neighborhood ng-model=customer.neighborhood ng-class="{\'input-loading\' : isCepLoading}"></div></div><div class=col-md-3><div class=material-input><input md-input=Cidade required="" name=city ng-model=customer.city ng-class="{\'input-loading\' : isCepLoading}"></div></div><div class=col-md-4><div class=material-input><select md-input=Estado required="" ng-model=customer.state ng-class="{\'input-loading\' : isCepLoading}"><option ng-repeat="st in states" value={{st.uf}}>{{st.name}}</option></select></div></div></div></div></form><form name=paymentForm key-enter=formSimpleSubmit(paymentForm); novalidate="" ng-show="index === 4" style="width: 720px"><h2>Pagamento</h2><p class=info>Escolha a forma de pagamento e informe os dados de seu cart\xE3o de cr\xE9dito. Somente s\xE3o aceitos pagamentos atrav\xE9s de cart\xE3o de cr\xE9dito (Visa, MasterCard, Diners Club e Elo).</p><p class=info>{{ product.pricing.description }}</p><div class=form-container><div class=row><div class="col-md-offset-1 col-md-3"><div class=material-input><select md-input="Forma de Pagamento" name=payConditions required="" ng-model=paymentProfile.installments ng-class="{\'input-gray\' : !paymentProfile.installments}" plg-auto-focus=paymentAutoFocus><option ng-repeat="ins in getInstallmentNumber(product.pricing.installments)" value={{ins}}>{{ (ins) > 1 ? ins + \' vezes\' : \'\xC0 vista\' }}</option></select></div></div></div><div class=row><div class="col-md-offset-1 col-md-3"><div class=material-input><input md-input="N\xFAmero do cart\xE3o" name=cardNumber ng-model=paymentProfile.cardNumber card-validator=number plg-auto-focus=cardNumberFocus required="" ui-mask="9999 9999 9999 9?9?9?9" ui-mask-placeholder="" ui-mask-placeholder-char="" placeholder="{{paymentForm.cardNumber.$viewValue ? \'_\' : \'\'}}"><p class=input-error ng-show="paymentForm.cardNumber.$invalid && paymentForm.cardNumber.$touched">N\xFAmero do cart\xE3o inv\xE1lido.</p></div></div><div class=col-md-5><div class=material-input><input md-input="Nome impresso no cart\xE3o" autocomplete=off ng-change="paymentProfile.cardName=paymentProfile.cardName.toUpperCase();" name=cardName ng-model=paymentProfile.cardName ng-minlength=1 ng-maxlength=100 required=""></div></div><div class=col-md-1><div class=material-input><input md-input=Validade name=validDate class=input-item ng-model=paymentProfile.validDate ui-mask=99/99 card-validator=date ui-mask-placeholder="" ui-mask-placeholder-char="" placeholder="{{paymentForm.validDate.$viewValue ? \'_\' : \'\'}}"><p class=input-error ng-show="paymentForm.validDate.$invalid && paymentForm.validDate.$touched">Validade inv\xE1lida.</p></div></div><div class=col-md-1><div class=material-input><input md-input=CVV type=password ng-model=paymentProfile.cvv required="" ng-minlength=3 ng-maxlength=3 maxlength=3></div></div></div></div></form><div ng-show="index === 5" style="width: 720px;"><h2>Resumo do pedido</h2><p class=info>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque laoreet velit</p><div class=form-container><div class="row col-md-offset-1 col-md-10"><div class=col-md-6><div class=material-input><input class="input-item hasValue" value={{customer.name}} disabled=""> <label>Nome</label> <span class=bar></span></div></div><div class=col-md-6><div class=material-input><input class="input-item hasValue" value={{customer.cpfCnpj}} disabled=""> <label>{{ customer.cpfCnpj.length < 12 ? \'CPF\' : \'CNPJ\' }}</label> <span class=bar></span></div></div></div><div class="row col-md-offset-1 col-md-10"><div class=col-md-6><div class=material-input><input class="input-item hasValue" value={{product.name}} disabled=""> <label>Produto</label> <span class=bar></span></div></div><div class=col-md-6><div class=material-input><input class="input-item hasValue" value="{{product.pricing.price + \' - \' + paymentProfile.installments + \'x\'}}" disabled=""> <label>Valor</label> <span class=bar></span></div></div></div><div class="row col-md-offset-1 col-md-10"><div class=col-md-6><div class=material-input><input class="input-item hasValue" value="XXXX.XXXX.XXXX.{{paymentProfile.cardNumber.substr(12, 4)}}" disabled=""> <label>Cart\xE3o</label> <span class=bar></span></div></div></div></div></div><div ng-show="index === 6" style="width: 720px"><h2>{{responseMessage}}</h2><p class=info>{{responseText}}</p></div></div></div><div class=dialog-footer ng-hide=isLoading><div ng-if="index === 0"><button type=button md-button="" ng-click=checkEmail(login.email); ng-disabled=emailForm.$invalid>Avan\xE7ar</button></div><div ng-if="index === 1"><button type=button class="md-button md-primary" ng-click="prevStep(loginForm); clearInputs();">Voltar</button> <button ng-if=createAccount type=button class="md-button md-primary" ng-click="formSimpleSubmit(); savePwd(login);" ng-disabled="loginForm.$invalid || (login.pwd !== login.confPwd && createAccount)">Avan\xE7ar</button> <button ng-if=!createAccount type=button class="md-button md-primary" ng-click=loginUser(login) ng-disabled=loginForm.$invalid>Avan\xE7ar</button></div><div ng-if="index === 2"><button type=button class="md-button md-primary" ng-click=prevStep(customerForm)>Voltar</button> <button type=button class="md-button md-primary" ng-click=formSimpleSubmit(customerForm); ng-disabled=customerForm.$invalid>Avan\xE7ar</button></div><div ng-if="index === 3"><button type=button class="md-button md-primary" ng-click=prevStep(customerComplementForm);>Voltar</button> <button type=button class="md-button md-primary" ng-click=formSimpleSubmit(customerComplementForm); ng-disabled=customerComplementForm.$invalid>Avan\xE7ar</button></div><div ng-if="index === 4"><button type=button class="md-button md-primary" ng-click=prevStep(paymentForm);>Voltar</button> <button type=button class="md-button md-primary" ng-disabled=paymentForm.$invalid; ng-click=formSimpleSubmit(paymentForm)>Avan\xE7ar</button></div><div ng-if="index === 5"><button type=button class="md-button md-primary" ng-click=prevStep()>Voltar</button> <button type=button class="md-button md-primary" ng-click="sendPayment(customer, paymentProfile, product)">Contratar</button></div><div ng-if="index === 6"><button type=button class="md-button md-primary" ng-if=!showError ng-hide=paymentError ng-click=redirectToPanel()>Acessar painel</button> <button type=button class="md-button md-primary" ng-if=!showError ng-show=paymentError ng-click=tryAgain(paymentProfile)>Tentar novamente</button> <button type=button class="md-button md-primary" ng-if=showError ng-click=close();>OK</button></div></div>');
$templateCache.put('email.html','<div class=dialog-inner><div class=loader ng-show=isLoading><div class=general-loader><div class=comment-icon><i class=dit></i> <i class=dit></i> <i class=dit></i></div></div><p>Aguarde enviando...</p></div><form name=emailForm style="width: 520px" ng-hide=isLoading><h2>Informe seu email</h2><p class=info>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque laoreet velit</p><div class=form-container><div class=row><div class="col-md-offset-1 col-md-10"><div class=material-input><input md-input=Remetente name=sender type=email ng-model=config.from required=""><p class="input-error help-block" ng-show="emailForm.sender.$error.required && emailForm.sender.$touched">Campo obrigat\xF3rio.</p><p class="input-error help-block" ng-show="emailForm.sender.$error.email && emailForm.sender.$touched">Email inv\xE1lido.</p></div></div></div><div class=row><div class="col-md-offset-1 col-md-10"><div class=material-input><input md-input=Destinat\xE1rio name=to type=email ng-model=config.to required=""><p class="input-error help-block" ng-show="emailForm.to.$error.required && emailForm.to.$touched">Campo obrigat\xF3rio.</p><p class="input-error help-block" ng-show="emailForm.to.$error.email && emailForm.to.$touched">Email inv\xE1lido.</p></div></div></div><div class=row><div class="col-md-offset-1 col-md-10"><div class=material-input><input md-input=Assunto name=subject type=text ng-model=config.subject required=""><p class="input-error help-block" ng-show="emailForm.subject.$error.required && emailForm.subject.$touched">Campo obrigat\xF3rio.</p></div></div></div><div class=row><div class="col-md-offset-1 col-md-10"><div class=material-input><textarea md-input=Descri\xE7\xE3o name=description ng-model=config.description required=""></textarea><p class="input-error help-block" ng-show="emailForm.description.$error.required && emailForm.description.$touched">Campo obrigat\xF3rio.</p></div></div></div></div></form><div><div class=dialog-footer><button type=button class=md-button ng-click=close()>Cancelar</button> <button type=button class="md-button md-primary" ng-disabled=emailForms.$invalid ng-click=sendEmail(config)>Enviar</button></div></div></div>');}]);