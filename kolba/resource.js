var XRegExp = require('xregexp').XRegExp;

var util = require('./util');

function Resource(mountPoint, callback, methods, type) {
    var re = XRegExp(mountPoint, 'x');
    var contentTypes = {};
    var urlArgs = {};

    this.update = function() {
        var callback;
        var methods;
        var resource;
        var type;

        if (arguments[0] instanceof Resource) {
            resource = arguments[0];
            callback = resource.getCallback();
            methods = resource.getMethods();
            type = resource.getType();
        } else {
            callback = arguments[0];
            methods = arguments[1];
            type = arguments[2];
        }

        this.doUpdate(callback, methods, type);
    };

    this.doUpdate = function(callback, methods, type) {
        type = type || 'text/html';
        methods = methods || ['GET'];
        if (methods.indexOf('HEAD') === -1) {
            methods.push('HEAD');
        }
        if (methods.indexOf('OPTIONS') === -1) {
            methods.push('OPTIONS');
        }

        if (typeof(contentTypes[type]) === 'undefined') {
            contentTypes[type] = {};
        } else {
            throw new Error('Resource "' + mountPoint + '" already defined');
        }

        contentTypes[type] = {
            'methods': methods,
            'callback': callback
        };
    };

    this.getRegExp = function() {
        return re;
    };

    this.getMountPoint = function() {
        return mountPoint;
    };

    this.getCallback = function() {
        return callback;
    };

    this.getType = function() {
        return type;
    };

    this.getMethods = function() {
        var i;
        var method;
        var methods = [];
        var type;

        for (type in contentTypes) {
            for (i in contentTypes[type].methods) {
                method = contentTypes[type].methods[i];
                if (methods.indexOf(method) === -1) {
                    methods.push(method);
                }
            }
        }

        return methods;
    };

    this.getUrlArgs = function() {
        return urlArgs;
    };

    function cacheRegExp(matches) {
        var key;

        for (key in matches) {
            // XRegExp uses positional references to the matches, i.e. 0, 1,
            // 2... We ignore those and use only non-numeric keys
            if (matches.hasOwnProperty(key) && isNaN(parseInt(key, 10))) {
                urlArgs[key] = matches[key];
            }
        }
    }

    this.matchesURL = function(url) {
        var matches = XRegExp.exec(url, re);

        if (matches === null) {
            return false;
        } else {
            if (mountPoint.indexOf('(?') > -1) {
                cacheRegExp(matches);
            }
        }

        return true;
    };

    this.allowsMethod = function(method) {
        var methods;
        var type;

        for (type in contentTypes) {
            methods = contentTypes[type].methods;

            if (methods.indexOf(method) > -1) {
                return true;
            }
        }

        return false;
    };

    this.acceptsType = function(accepts, method) {
        var i;

        if (accepts.indexOf('*/*') > -1) {
            return true;
        }

        for (i in accepts) {
            if (typeof(contentTypes[accepts[i]]) !== 'undefined') {
                if (contentTypes[accepts[i]].methods.indexOf(method) > -1) {
                    return true;
                }
            }
        }

        return false;
    };

    var getResourceByAcceptHeader = function(locals) {
        var accepts = locals.getRequest().acceptedTypes();
        var _resource;
        var _type;
        var i;
        var found = false;

        for (i in accepts) {
            if (!found && accepts[i] !== '*/*') {
                if (typeof(contentTypes[accepts[i]]) !== 'undefined') {
                    _resource = contentTypes[accepts[i]];
                    _type = accepts[i];
                }
            }
        }

        // Means we got */* so we didn't find a specific resource
        if (!_resource) {
            // We get the first defined callback
            _resource = contentTypes[type];
            _type = type;
        }

        return {
            'callback': _resource.callback,
            'methods': _resource.methods,
            'type': _type
        };
    };

    this.takeOver = function(locals) {
        var injected;
        var injector = locals.getInjector();
        var resource = getResourceByAcceptHeader(locals);
        var response;
        var result;

        injector.update(urlArgs);
        injected = injector.inject(resource.callback);

        locals.emit('Resource:preRequest');

        result = injected();

        if (util.isPromise(result)) {
            result.then(function (response) {
                console.log('Resolving "%s"', response.toString());
                locals.updateResponse(response);
                locals.getResponse().setContentType(resource.type);
                complete(locals);
            });
        } else {
            locals.updateResponse(result);
            locals.setContentType(resource.type);

            complete(locals);
        }
    };

    var complete = function(locals) {
        locals.on('Interceptor:completed', function(locals) {
            locals.emit('Resource:postRequest', locals);
        });
        locals.emit('Resource:completed', locals);
    };

    this.update(callback, methods, type);
}

function ExternalResource(mountPoint, component) {
    this.getMountPoint = function() {
        return mountPoint;
    };

    this.getApp = function() {
        return component;
    };
}

module.exports = {
    "ExternalResource": ExternalResource,
    "Resource": Resource
};
