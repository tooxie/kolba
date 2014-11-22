var Kolba = require('kolba');
var Promise = require('kolba/promise');
var expect = require('expect.js');
var Client = require('../client');

describe('Interceptors', function() {
    before(function() {
        this.app = new Kolba();

        this.app.resource('^/$', function() {
            return 'Home';
        });

        this.app.resource('^/err$', function() {
            return 500;
        });

        this.app.on(200, function(response) {
            response.setBody('Gotcha!');

            return response;
        });

        this.app.on(500, function() {
            var deferred = Promise.defer();

            process.nextTick(function() {
                deferred.resolve('body');
            });

            return deferred.promise;
        });

        this.app.listen(3001);

        this.client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        this.app.stop();
    });

    it('intercept a 200 response and set the body', function(done) {
        this.client.get('/', function(response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Gotcha!');
            expect(response.headers['content-type']).to.equal('text/html');
            done();
        });
    });

    it('accepts (and understands) a promise as result', function(done) {
        this.client.get('/err', function(response, body) {
            expect(response.statusCode).to.equal(500);
            expect(body).to.equal('body');
            expect(response.headers['content-type']).to.equal('text/html');
            done();
        });
    });
});
