var Kolba = require('kolba');
var Promise = require('kolba/promise');
var expect = require('expect.js');
var Client = require('../client');

describe('Kolba asynchronous resources', function() {
    var app;
    var client;

    before(function() {
        app = new Kolba();

        app.beforeRequest(function(request) {
            if (request.path === '/prom') {
                var deferred = Promise.defer();

                process.nextTick(function() {
                    deferred.resolve('Prom middleware');
                });

                return deferred.promise;
            }
        });

        app.resource('^/async$', function() {
            console.log('*** View for /async');
            var deferred = Promise.defer();

            process.nextTick(function() {
                deferred.resolve('Promesa async');
            });

            return deferred.promise;
        });

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('does not fail when a middleware returns a promise', function(done) {
        client.get('/prom', function(response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Prom middleware');
            done();
        });
    });

    it('resolves the view asynchronously', function(done) {
        client.get('/async', function(response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Promesa async');
            done();
        });
    });
});
