/*
 +-----------------------------------+
 |   Truth table for status codes    |
 +--------+--------+--------+--------+
 | Path   | Method | Accept | Code   |
 +--------+--------+--------+--------+
 | false  | false  | false  | 404    |
 | false  | false  | true   | 404    |
 | false  | true   | false  | 404    |
 | false  | true   | true   | 404    |
 | true   | false  | false  | 405    |
 | true   | false  | true   | 405    |
 | true   | true   | false  | 406    |
 | true   | true   | true   | 200    |
 +--------+--------+--------+--------+
*/

var Kolba = require('kolba');
var expect = require('expect.js');
var Client = require('../client');

describe('Status code', function() {
    var app;
    var client;

    before(function() {
        app = new Kolba.App();

        app.resource('^/$', function() {
            return 'Home';
        });

        app.resource('^/users$', function() {
            return 'Home';
        }, ['GET', 'POST']);

        app.resource('^/users$', function() {
            return 'Home';
        }, ['DELETE'], 'text/plain');

        app.resource('^/dup$', function() {
            return 'Dup!';
        }, ['POST'], 'text/plain');

        app.resource('^/dup$', function() {
            return 'Dup!';
        }, ['GET', 'POST', 'PUT'], 'text/json');

        app.on(200, function(response) {
            response.setBody('Gotcha!');

            return response;
        });

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    describe('view', function() {
        it('is 404 if it does not match any path', function(done) {
            client.get('/notfo', function(response, body) {
                expect(response.statusCode).to.be(404);
                expect(response.headers['content-type']).to.equal('text/html');
                done();
            });
        });

        it('is 405 if path matches but method does not', function(done) {
            client.put('/', function(response, body) {
                expect(response.statusCode).to.be(405);
                expect(response.headers['allow']).to.equal('GET, HEAD, OPTIONS');
                expect(response.headers['content-type']).to.equal('text/html');
                done();
            });
        });

        it('is 405 and a list of allowed methods', function(done) {
            client.put('/users', function(response, body) {
                expect(response.statusCode).to.be(405);
                expect(response.headers['allow']).to.equal('GET, POST, HEAD, OPTIONS, DELETE');
                expect(response.headers['content-type']).to.equal('text/html');
                done();
            });
        });

        it('is 406 if method exists but not for this specific content type', function(done) {
            client.put({
                url: '/dup',
                headers: {
                    'Accept': 'text/plain'
                }
            }, function(response, body) {
                expect(response.statusCode).to.be(406);
                expect(response.headers['content-type']).to.equal('text/html');
                done();
            });
        });

        it('is 406 if path and method matches, but not content type', function(done) {
            client.get({
                url: '/',
                headers: {
                    Accept: 'herp/derp'
                }
            }, function(response, body) {
                expect(response.headers['content-type']).to.equal('text/html');
                expect(response.statusCode).to.be(406);
                done();
            });
        });

        it('is 200 for a non-GET method', function(done) {
            client.put({
                url: '/dup',
                headers: {
                    'Accept': 'text/json'
                }
            }, function(response, body) {
                expect(response.statusCode).to.be(200);
                expect(response.headers['content-type']).to.equal('text/json');
                done();
            });
        });

        it('is 200 when no Accept is sent and picks the first resource defined', function(done) {
            client.put('/dup', function(response, body) {
                expect(response.headers['content-type']).to.equal('text/plain');
                expect(response.statusCode).to.be(200);
                done();
            });
        });

        it('is 200 and gets intercepted', function(done) {
            client.get('/', function(response, body) {
                expect(response.headers['content-type']).to.equal('text/html');
                expect(response.statusCode).to.be(200);
                expect(body).to.be('Gotcha!');
                done();
            });
        });
    });
});
