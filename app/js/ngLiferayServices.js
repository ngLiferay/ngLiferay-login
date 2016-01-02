(function(window, angular, $, Liferay, undefined) {
  'use strict';
  var module = angular.module("ngLiferay-login");



  module
    .factory("AuthService", function(ngLiferayHttp, HelperService) {
      var loginURL = '/web/guest/home?p_p_id=58&p_p_lifecycle=1&p_p_state=maximized&p_p_mode=view&_58_struts_action=%2Flogin%2Flogin',
        logoutURL = '/c/portal/logout';

      var R = ngLiferayHttp('', {
        login: {
          url: loginURL,
          method: "POST",
          namespace: "58"
        },
        logout: {
          url: logoutURL
        }
      });

      return R;
    });

  module
    .factory("HelperService", function(ngLiferayHttp, ngLiferayAuth) {
      var url = "/?p_p_id=nghelper_WAR_nghelperportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=";

      var R = ngLiferayHttp('', {


        getJournalArticlesJSON: {
          url: url + "getJournalArticlesJSON",
          method: "POST",
          namespace: "nghelper_WAR_nghelperportlet"
        },

        getJournalArticleJSON: {
          url: url + "getJournalArticleJSON",
          method: "POST",
          namespace: "nghelper_WAR_nghelperportlet"
        },

        getThemeDisplayJSON: {
          url: url + "getThemeDisplayJSON",
          method: "POST"

        }

      });

      /* R.configureData = function() {
       	  var deferred = $q.defer();
       	  R.getThemeDisplayJSON().then(function(data) {
       		  ngLiferayAuth.setData(data);
       		  deferred.resolve(data);
       	  },
       	  function(error){
       		  deferred.reject(error);
       	  });

       	  return deferred.promise;
         };

         //run configure data for first time
         R.configureData();*/

      //Init ngLiferayAuth from Liferay
      ngLiferayAuth.setData(Liferay.themeDisplay);

      return R;
    });

  module
    .factory('LanguageService', function(ngLiferayHttp, ngLiferayAuth, HelperService, $q) {
      var cache = {};

      var url = "/language/" + ngLiferayAuth.themeDisplay.languageId + "/",
        R = ngLiferayHttp('', {
          _get: {
            method: "POST"
          }
        });

      R.get = function(key, extraParams) {
        var deferred = $q.defer(),
          val = !extraParams && cache[key];

        if (val) {
          deferred.resolve(val);
        } else {
          var serializeExtraParams = extraParams ? angular.isArray(extraParams) ? extraParams.join("/")
          : extraParams: "";

          R._get(url + key + "/" + serializeExtraParams, {
            p_auth: ngLiferayAuth.authToken
          }).then(function(val) {
            if(!extraParams){
              cache[key] = val;
            }
            deferred.resolve(val);
          });
        }
        return deferred.promise;
      };

      return R;

    });

  module
    .factory('ngLiferayAuth', function() {
      var props = ['authToken', 'currentUserId'];
      var propsPrefix = '$lr_ng$';

      function save(storage, name, value) {
        var key = propsPrefix + name;
        if (value === null) {
          value = '';
        }
        storage[key] = value;
      }

      function load(name) {
        var key = propsPrefix + name;
        return localStorage[key] || sessionStorage[key] || null;
      }

      function ngLiferayAuth() {
        var self = this;
        props.forEach(function(name) {
          self[name] = load(name);
        });
        this.rememberMe = undefined;
        this.currentUser = null;
        this.themeDisplay = null;
      }

      ngLiferayAuth.prototype.save = function() {
        var self = this;
        var storage = this.rememberMe ? localStorage : sessionStorage;
        props.forEach(function(name) {
          save(storage, name, self[name]);
        });
      };

      ngLiferayAuth.prototype.setData = function(data) {
        this.currentUser = data.user;
        this.currentUserId = data.user.userId;
        this.authToken = data.authToken;

        delete data.user;
        this.themeDisplay = data;

        this.save();
      };

      ngLiferayAuth.prototype.clearData = function() {
        this.authToken = null;
        this.currentUserId = null;
        this.currentUser = null;
        this.themeDisplay = null;

        this.clearStorage();
      };

      ngLiferayAuth.prototype.clearStorage = function() {
        props.forEach(function(name) {
          save(sessionStorage, name, null);
          save(localStorage, name, null);
        });
      };

      return new ngLiferayAuth();

    });

  module
    .provider("ngLiferayHttp", function ngLiferayHttpProvider() {
      var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction,
        isString = angular.isString;
      this.$get = ['$http', '$q', '$httpParamSerializerJQLike', function($http, $q, $httpParamSerializerJQLike) {
        return function(url, actions) {
          var service = {};

          /**
           * obj has 3 properties
           * 	url -
           * 	method -
           * 	data -
           */
          function doHttpCall(obj) {
            obj.method = obj.method || "GET";
            var deferred = $q.defer();

            //Checking liferay services cmd parameter & stringify it.
            var cmd = obj.data.cmd;
            if (cmd) {
              obj.data.cmd = JSON.stringify(cmd);
            }
            var o = {
              url: obj.url,
              method: obj.method
            };

            if (obj.method.toUpperCase() === "POST") {
              o.data = $httpParamSerializerJQLike(obj.data);
              o.headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
              };
            } else { // for GET requests
              o.params = obj.data;
            }

            $http(o).success(function(data) {
              deferred.resolve(data);
            }).error(function(data) {
              deferred.reject(data);
            });

            return deferred.promise;
          }

          /**
           * action properties:
           * 	url: url to call http
           * 	method: Http method, POST or GET
           * 	params: data or params provided in http call
           */

          forEach(actions, function(action, name) {

            /**
             * action url: will override the url provided
             * data: data provided to http
             */
            service[name] = function(actionURL, data) {
              var u;
              if (isString(actionURL)) {
                u = actionURL;
              } else {
                u = action.url || url;
                data = actionURL;
              }
              var o = {
                url: u,
                method: action.method,
                data: extend({}, action.params, data)
              };

              //change params name if namespace is provided in action
              var ns = action.namespace;
              if (ns) {
                data = {};
                forEach(o.data, function(d, key) {
                  data["_" + ns + "_" + key] = d;
                });
                o.data = data;
              }
              return doHttpCall(o);
            };
          });

          return service;
        };
      }];

    });


})(window, window.angular, window.jQuery, window.Liferay);
