'use strict';

var DEV_HOST = "http://localhost:9000";

var module = angular.module('ngLiferay-login');

/*angular.module('ngLrApp')
  .run(function ($rootScope, $templateFactory) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    	console.log(toState.templateUrl);
    	console.log($templateFactory);

    	toState.templateUrl &&
    	(toState.templateUrl.indexOf("http://localhost:9000") === -1) &&
    	(toState.templateUrl = "http://localhost:9000/" + toState.templateUrl);
    })
  });*/

function urlParser(url) {
  var parser = document.createElement('a');
  parser.href = url;
  return parser;
}

/**
 * Directive to resolve the image url to localhost in dev env
 */
module
  .directive('fallback', function() {
    var fallbackSrc = {
      link: function postLink(scope, iElement) {
        iElement.bind('error', function() {
          iElement.attr("src", DEV_HOST + "/" + iElement.attr("src"));
        });
      }
    };
    return fallbackSrc;
  });

/**
 * HTTP Interceptor to resolve views to localhost in dev env
 */
module
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('devInterceptor');
  })
  .factory('devInterceptor', function() {

    return {
      request: function(config) {
        var url = config.url;
        if (url.indexOf(".html") > -1 && url.indexOf("views/") > -1) {
          var u = urlParser(url);
          config.url = DEV_HOST + u.pathname + u.search + u.hash;
        }
        return config;

      },
    };
  });
