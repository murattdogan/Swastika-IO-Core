﻿'use strict';
app.factory('commonServices', ['$location', '$http', '$rootScope', 'authService', 'localStorageService', function ($location, $http, $rootScope, authService, localStorageService) {
    var adminCommonFactory = {};
    var _settings = {
        lang: '',
        cultures: []
    }
    var _translator = {}

    var _showAlertMsg = function (title, message) {
        $rootScope.message = {
            title: title,
            value: message
        };
        $('#modal-msg').modal('show');
    };

    var _checkfile = function (sender, validExts) {
        var fileExt = sender.value;
        fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
        if (validExts.indexOf(fileExt) < 0) {
            _showAlertMsg("", "Invalid file selected, valid files are of " + validExts.toString() + " types.");
            sender.value = "";
            return false;
        }
        else return true;
    };

    var _getSettings = async function (culture) {
        var settings = localStorageService.get('settings');
        if (settings) {
            return settings;
        }
        else {
            var url = 'api/portal';
            if (culture) {
                url += '/' + culture;
            }
            url += '/settings';
            var req = {
                method: 'GET',
                url: url
            };
            return _getApiResult(req).then(function (response) {
                return response.data;
            });
        }
    };

    var _getTranslator = async function (culture) {
        var translator = localStorageService.get('translator');
        if (translator) {
            return translator;
        }
        else {
            var url = 'api/portal';
            if (culture) {
                url += '/' + culture;
            }
            url += '/translator';
            var req = {
                method: 'GET',
                url: url
            };
            return _getApiResult(req).then(function (response) {
                return response.data;
            });
        }
    };

    var _setSettings = async function (settings) {
        if (settings && settings.cultures.length > 0) {
            localStorageService.set('settings', settings);            
        }
    };

    var _removeSettings = async function (settings) {
        localStorageService.remove('settings');
    };

    var _removeTranslator = async function () {
        localStorageService.remove('translator');
    };

    var _fillSettings = async function (culture) {
        var settings = localStorageService.get('settings');
        if (settings) {
            _settings = settings;
            return settings;
        }
        else {
            settings = await _getSettings(culture);
            localStorageService.set('settings', settings);
            return settings;
        }

    };

    var _fillTranslator = async function (culture) {
        var translator = localStorageService.get('translator');
        if (translator) {
            _translator = translator;
            return translator;
        }
        else {
            translator = await _getTranslator(culture);
            localStorageService.set('translator', translator);
            return translator;
        }

    };

    var _getApiResult = async function (req) {
        $rootScope.isBusy = true;
        req.Authorization = authService.authentication.token;

        if (!req.headers) {
            req.headers = {
                'Content-Type': 'application/json'
            };
        }
        req.headers.Authorization = 'Bearer ' + authService.authentication.token;
        return $http(req).then(function (resp) {
            //var resp = results.data;
            $rootScope.isBusy = false;
            return resp.data;
        },
            function (error) {
                if (error.status === 401) {
                    //Try again with new token from previous Request (optional)                
                    return authService.refreshToken(authService.authentication.refresh_token).then(function () {
                        req.headers.Authorization = 'Bearer ' + authService.authentication.token;
                        return $http(req).then(function (results) {
                            $rootScope.isBusy = false;
                            return results.data;
                        }, function (err) {
                            $rootScope.isBusy = false;
                            authService.logOut();
                            authService.authentication.token = null;
                            authService.authentication.refresh_token = null;
                            authService.authentication.referredUrl = $location.$$url;
                            $location.path('/backend/login');
                        });
                    }, function (err) {

                        var t = { isSucceed: false, errors: [err.statusText] };
                        $rootScope.isBusy = false;
                        authService.logOut();
                        authService.authentication.token = null;
                        authService.authentication.refresh_token = null;
                        authService.authentication.referredUrl = $location.$$url;
                        $location.path('/backend/login');
                        return t;
                    }
                    );
                }
                else if (error.status === 403) {
                    var t = { isSucceed: false, errors: ['Forbidden'] };
                    $location.path('/backend/login');
                    return t;
                }
                else {
                    var t = { isSucceed: false, errors: [error.statusText] };
                    $rootScope.isBusy = false;
                    return t;
                }
            });
    };
    adminCommonFactory.getApiResult = _getApiResult;
    adminCommonFactory.getSettings = _getSettings;
    adminCommonFactory.getTranslator = _getTranslator;
    adminCommonFactory.fillTranslator = _fillTranslator;
    adminCommonFactory.setSettings = _setSettings;
    adminCommonFactory.removeSettings = _removeSettings;
    adminCommonFactory.removeTranslator = _removeTranslator;
    adminCommonFactory.showAlertMsg = _showAlertMsg;
    adminCommonFactory.checkfile = _checkfile;
    adminCommonFactory.fillSettings = _fillSettings;
    adminCommonFactory.settings = _settings;
    return adminCommonFactory;

}]);
