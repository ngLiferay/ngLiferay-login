'use strict';

var app = angular.module("ngLiferay-login", [
  'ui.bootstrap',
  'ngMessages',
  'ngLiferay-language'
]);

// app.config(function() {
//   console.log("$stateProvider");
// });

app.directive('ngLiferayLogin', function($uibModal) {
    return {
      templateUrl: function(elem, attr) {
        if (attr.ngLiferayLogin === "modal") {
          return "views/simple.html";
        } else {
          return "views/login.html";
        }
      },
      scope: {
        modal: '&'
      },
      replace: false,
      transclude: true,
      link: function(scope, elem, attr) {
        if (attr.ngLiferayLogin === "modal") {
          var opts = scope.modal() || {};
          elem.on("click", function(e) {
            opts = angular.extend({
              size: 'lg'
            }, opts);

            opts.templateUrl = 'views/login.html';

            $uibModal.open(opts);
            e.preventDefault();
          });
        }
      }
    };
  })
  .controller('LoginDirectiveCtrl', function($scope, LanguageService, AuthService, HelperService,
    ngLiferayAuth, $rootScope) {

      function getSignedInUser(){
        var user = ngLiferayAuth.currentUser;
        LanguageService.get("you-are-signed-in-as-x", user.firstName + " " + user.lastName).then(function(s) {
          $scope.welcomeMsg = s;
        });
      }

    LanguageService.get("this-field-is-required").then(function(s) {
      $scope.requiredErrMsg = s;
    });

    LanguageService.get("please-enter-a-valid-email-address").then(function(s) {
      $scope.emailErrMsg = s;
    });

    if(ngLiferayAuth.themeDisplay.isSignedIn){
      $scope.isSignedIn = true;
      getSignedInUser();
    }

    $scope.login = function(form) {
      $scope.submitted = true;

      if (form.$valid) {
        AuthService.login($scope.user)
          .then(function() {
            //check for user loggedin
            HelperService.getThemeDisplayJSON().then(function(data) {
              ngLiferayAuth.setData(data);
              if (data.isSignedIn) {
                getSignedInUser();
                $scope.isSignedIn = true;

                //broadcast user SignedIn via rootScope
                $rootScope.$broadcast("userSignedIn", ngLiferayAuth.currentUser);
              } else {
                  $scope.showAuthFailErr = true;
              }
            });
          });
      }
    };
  });

angular.module('ngLiferay-login').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/login.html',
    "<div class=\"mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2\" id=\"loginbox\" ng-controller=\"LoginDirectiveCtrl\" style=\"margin-top:50px;\">\n" +
    "  <div class=\"panel panel-info\">\n" +
    "    <div class=\"panel-heading\">\n" +
    "      <div class=\"panel-title\" ng-liferay-lang=\"sign-in\"></div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"panel-body\" style=\"padding-top:30px\">\n" +
    "\n" +
    "      <div class=\"logged-out\" ng-show=\"!isSignedIn\">\n" +
    "        <uib-alert close=\"showAuthFailErr = false\" type=\"danger\" ng-show=\"showAuthFailErr\">\n" +
    "          <span ng-liferay-lang=\"authentication-failed\"></span>\n" +
    "        </uib-alert>\n" +
    "\n" +
    "        <form id=\"loginForm\" name=\"loginForm\" ng-submit=\"login(loginForm)\" novalidate=\"\" role=\"form\">\n" +
    "\n" +
    "          <div class=\"form-group\" ng-class=\"{ &apos;has-error&apos;: loginForm.email.$touched &amp;&amp; loginForm.email.$invalid }\">\n" +
    "            <label for=\"email\" ng-liferay-lang=\"email-address\"></label>\n" +
    "            <input class=\"form-control\" name=\"email\" ng-liferay-lang=\"{key: &apos;email-address&apos;, attr: &apos;placeholder&apos;}\" ng-model=\"user.login\" placeholder=\"\" required type=\"email\">\n" +
    "\n" +
    "            <div class=\"help-block\" ng-if=\"loginForm.email.$touched\" ng-messages=\"loginForm.email.$error\">\n" +
    "              <p ng-message=\"required\">{{requiredErrMsg}}</p>\n" +
    "              <p ng-message=\"email\">{{emailErrMsg}}</p>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          <div class=\"form-group\" ng-class=\"{ &apos;has-error&apos;: loginForm.password.$touched &amp;&amp; loginForm.password.$invalid }\">\n" +
    "            <label for=\"password\" ng-liferay-lang=\"password\"></label>\n" +
    "            <input class=\"form-control\" id=\"password\" name=\"password\" ng-liferay-lang=\"{key: &apos;password&apos;, attr: &apos;placeholder&apos;}\" ng-model=\"user.password\" placeholder=\"\" required type=\"password\">\n" +
    "\n" +
    "            <div class=\"help-block\" ng-if=\"loginForm.password.$touched\" ng-messages=\"loginForm.password.$error\">\n" +
    "              <p ng-message=\"required\">{{requiredErrMsg}}</p>\n" +
    "            </div>\n" +
    "          </div>\n" +
    "\n" +
    "          <button class=\"btn btn-default\" ng-disabled=\"loginForm.$invalid\" ng-liferay-lang=\"login\" type=\"submit\"></button>\n" +
    "        </form>\n" +
    "\n" +
    "      </div>\n" +
    "\r" +
    "\n" +
    "      <div class=\"logged-in\" ng-show=\"isSignedIn\">\r" +
    "\n" +
    "        <div ng-bind=\"welcomeMsg\"></div>\r" +
    "\n" +
    "      </div>\r" +
    "\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\r" +
    "\n"
  );


  $templateCache.put('views/simple.html',
    "<span ng-transclude=\"\"></span>\n"
  );

}]);
