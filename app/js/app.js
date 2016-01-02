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
