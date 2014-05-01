var expect = require('expect.js');
var Kolba = require('kolba');

var Client = require('../client');

describe('Accept header based resources', function() {
    var app;
    var client;

    before(function() {
        app = new Kolba.App();

        app.resource('^/herp$', function() {
            return 'DERP';
        }, ['GET'], 'text/plain');

        app.resource('^/herp$', function() {
            return {
                'HERP': 'DERP'
            };
        }, ['GET'], 'application/json');

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('executes default resource', function(done) {
        client.get('/herp', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(response.headers['content-type']).to.equal('text/plain');
            expect(body).to.equal('DERP');
            done();
        });
    });

    it('executes the first defined resource', function(done) {
        client.get({
            url: '/herp',
            headers: {
                'Accept': 'text/plain'
            }
        }, function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(response.headers['content-type']).to.equal('text/plain');
            expect(body).to.equal('DERP');
            done();
        });
    });

    it('executes the second defined resource', function(done) {
        client.get({
            url: '/herp',
            headers: {
                'Accept': 'application/json'
            }
        }, function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(response.headers['content-type']).to.equal('application/json');
            done();
        });
    });
});
