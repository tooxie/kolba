var expect = require('expect.js');

var Kolba = require('kolba');
var Client = require('../client');

describe('Kolba middlewares', function() {
    var app;
    var client;

    before(function() {
        app = new Kolba.App();

        app.beforeRequest(function(request, response) {
            console.log('*** First middleware');
            // console.log('   ' + request.path);
            if (request.path === '/favicon.ico') {
                console.log('Returning 404 for /favicon.ico...');
                response.setStatusCode(404);
                response.setBody('Not found');
                return response;
            }
        });

        app.beforeRequest(function(request) {
            console.log('*** Second middleware');
            // console.log('   ' + request.path);

            if (request.path === '/favicon.ico') {
                throw new Error('You should not be here');
            }

            if (request.path === '/') {
                return 'Second midd';
            }
        });

        app.resource('^/$', function() {
            console.log('*** View for /');
            return 'Hola';
        });

        /* TODO: Write a regression test for this case, it was being executed
         * but mocha doesn't take exceptions as errors, only assertions.
         */
        app.resource('^/favicon.ico$', function() {
            console.log('*** View for /favicon.ico');
            throw new Error('You should not be here');
        });

        app.resource('^/hola$', function() {
            console.log('*** View for /hola');
            return 'Hola';
        });

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('returns 404 and aborts execution', function(done) {
        client.get('/favicon.ico', function(response, body) {
            expect(response.statusCode).to.equal(404);
            expect(body).to.equal('Not found');
            done();
        });
    });

    it('returns a string and aborts execution', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Second midd');
            done();
        });
    });

    it('lets the view execute', function(done) {
        client.get('/hola', function(response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Hola');
            done();
        });
    });
});
