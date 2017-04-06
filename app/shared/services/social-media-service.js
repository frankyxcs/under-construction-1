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