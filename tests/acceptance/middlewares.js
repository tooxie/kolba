var expect = require('expect.js');

var Kolba = require('kolba');
var MiddlewareRunner = require('kolba/middlewares');
var mocks = require('../mocks');

describe('Middleware runner', function() {
    describe('runs request middlewares', function() {
        var middlewares;

        before(function() {
            middlewares = new MiddlewareRunner();

            middlewares.addRequestMiddleware(function() {
                console.log('Middleware 1');
            });

            middlewares.addRequestMiddleware(function() {
                console.log('Middleware 2');

                return 2;
            });

            middlewares.addRequestMiddleware(function() {
                console.log('Middleware 3');
                throw new Error('You should not be here');
            });
        });

        it('and returns a value', function(done) {
            var locals = mocks.locals;
            var promise = middlewares.runRequestMiddlewares(locals);

            promise.then(function(value) {
                expect(value).to.be(2);
                done();
            });
        });
    });
});
