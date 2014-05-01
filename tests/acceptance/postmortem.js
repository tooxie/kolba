var expect = require('expect.js');
var Kolba = require('kolba');

var Client = require('../client');

describe('Post mortem', function() {
    var app;
    var client;
    var postMortemFlag = false;

    before(function() {
        app = new Kolba.App();

        app.resource('^/herp$', function() {
            return 'DERP';
        }, ['GET'], 'text/html');

        app.postMortem(function() {
            postMortemFlag = true;
        });

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('Runs after the resource', function(done) {
        client.get('/herp', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(body).to.be('DERP');
            expect(postMortemFlag).to.be(true);
            done();
        });
    });
});
