var ObjectList = require('./util').ObjectList;
var Promise = require('./promise');

function Middleware(callback) {
    this.execute = function(locals) {
        var injector = locals.getInjector();
        var result = injector.inject(callback)();

        if (!Promise.isPromise(result)) {
            result = Promise(result);
        }

        return result;
    };
}

function MiddlewareRunner() {
    var requestMiddlewares = new ObjectList();
    var responseMiddlewares = new ObjectList();

    var run = function(middlewares, locals) {
        var deferred = Promise.defer();
        var runner = Promise();

        var runAt = function(index) {
            var executing;
            var middleware;
            var promiseState;

            // If we are out of middlewares and none of them returned a value,
            // or there are just none of them to execute, reject the promise.
            if (middlewares.length <= index) {
                deferred.reject();

                return undefined;
            }

            promiseState = deferred.promise.inspect().state;

            if (promiseState === 'pending') {
                middleware = middlewares.get(index);
                executing = middleware.execute(locals);

                executing.then(function(value) {
                    if (typeof(value) === 'undefined') {
                        runAt(index + 1);
                    } else {
                        deferred.resolve(value);
                    }
                });
            }
        };

        runAt(0);

        return deferred.promise;
    };

    this.addRequestMiddleware = function(middleware) {
        requestMiddlewares.append(new Middleware(middleware));
    };

    this.addResponseMiddleware = function(middleware) {
        responseMiddlewares.append(new Middleware(middleware));
    };

    this.runRequestMiddlewares = function(locals) {
        var promise;

        locals.emit('Middleware:preRequest');

        function onSuccess(value) {
            locals.updateResponse(value);
            locals.emit('Middleware:abort');
            // locals.emit('Middleware:postRequest')
        }

        // When no middleware returns, the promise will be rejected and it will
        // be treated as an error, but it's nothing to worry about.
        function onError(error) {
            locals.emit('Middleware:postRequest');
        }

        promise = run(requestMiddlewares, locals);
        promise.then(onSuccess, onError);

        return promise;
    };

    this.runResponseMiddlewares = function(locals) {
        var promise;

        locals.emit('Middleware:preResponse');

        function onSuccess(value) {
            locals.updateResponse(value);
        }

        function onError(error) {
            locals.emit('Middleware:postResponse');
        }

        promise = run(responseMiddlewares, locals);
        promise.then(onSuccess, onError);

        return promise;
    };

    this.end = function(locals) {
        locals.emit('Middleware:postResponse');
    };
}

module.exports = MiddlewareRunner;
