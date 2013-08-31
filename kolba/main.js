var Config = require('./config/loader');
var Domain = require('./domain');
var getLocals = require('kolba').getLocals;
var Header = require('./header');
var MiddlewareRunner = require('./middlewares');
var ObjectList = require('./util').ObjectList;
var PostMortem = require('./postmortem');
var Promise = require('./promise');
var RequestLocals = require('./locals');
var Resource = require('./resource');
var Router = require('./router');
var Server = require('./server');

function Kolba(config) {
    // Instance variables
    var interceptors = {};
    var middlewares = new MiddlewareRunner();
    var postMortem = new PostMortem();
    var router = new Router();
    var server;

    config = new Config(config || {});

    // Public methods
    this.beforeRequest = function(callback) {
        middlewares.addRequestMiddleware(callback);
    };

    this.afterRequest = function(callback) {
        middlewares.addResponseMiddleware(callback);
    };

    this.resource = function(mountPoint, callback, methods, type) {
        methods = methods || config.get('methods');
        type = type || config.get('contentType');

        router.addRoute(new Resource(mountPoint, callback, methods, type));
    };

    this.on = function(code, callback) {
        interceptors[code] = callback;
    };

    this.postMortem = function(callback) {
        postMortem.append(callback);
    };

    this.run = function(port) {
        var deferred = Promise.defer();
        var server = new Server(port || config.get('port'));

        var requestListener = function(request, response) {
            var domain = new Domain();

            // FIXME: This ain't working
            domain.onError(function(error) {
                var locals = getLocals();
                var injector = locals.getInjector();
                var returned = injector.inject(this.interceptors[500])();

                console.log(error);

                locals.updateResponse(returned);
                locals.updateResponse(500);
                locals.flush();
            });

            domain.run(function() {
                var locals = getNewLocals({
                    'request': request,
                    'response': response
                });

                process.domain.locals = locals;
                requestHandler(locals);
            });
        };

        server.run(requestListener).then(function() {
            console.log(' * Running on http://127.0.0.1:' + port);
            deferred.resolve(server);
        });

        this.server = server;

        return deferred.promise;
    };

    this.stop = function() {
        console.log('Stopping server...');
        this.server.stop();
    };

    // Private methods
    var getNewLocals = function(args) {
        var locals = new RequestLocals({
            'config': config,
            'request': args.request,
            'response': args.response
        });

        return locals;
    };

    var subscribeMiddlewares = function(locals) {
        locals.on('Main:preRequest', middlewares.runRequestMiddlewares);
        locals.on('Resource:postRequest', middlewares.runResponseMiddlewares);
    };

    var subscribeInterceptors = function(locals) {
        locals.on('Resource:completed', function(locals) {
            var injector = locals.getInjector();
            var response = locals.getResponse();
            var interceptor = interceptors[response.getStatusCode()];

            if (typeof(interceptor) !== 'undefined') {
                locals.updateResponse(injector.inject(interceptor)());
            }
        });
    };

    var logStats = function(locals) {
        var req = locals.getRequest();
        var accepts = locals.getAcceptedTypes().join(', ');

        console.log('%s %s HTTP/%s %s %s', req.method, req.path,
                    req.httpVersion, locals.getStatusCode(), accepts);
    };

    var requestHandler = function(locals) {
        // Subscriptions
        subscribeInterceptors(locals);
        subscribeMiddlewares(locals);

        locals.on('Middleware:abort', end);
        locals.on('Middleware:postRequest', router.dispatch);
        locals.on('Middleware:postResponse', end);
        locals.on('Main:postRequest', logStats);
        locals.on('Main:postRequest', postMortem.run);

        // Publish our events
        // Middlewares get executed here
        locals.emit('Main:preRequest');
    };

    var end = function(locals) {
        locals.flush();
        locals.emit('Main:postRequest');
    };
}

module.exports = Kolba;
