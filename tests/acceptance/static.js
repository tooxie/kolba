var Kolba = require('kolba');
var expect = require('expect.js');
var mock = require('mock-fs');
var Client = require('../client');

describe('static resource', function() {
    var app;
    var client;

    before(function() {
        mock({'./images/kolba.js': '{}'});

        app = new Kolba.App();

        app.static('/static', './images');

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        mock.restore();
        app.stop();
    });

    it('does not exist', function(done) {
        client.get('/static/favicon.ico', function(response, body) {
            expect(response.statusCode).to.be(404);
            done();
        });
    });

    it('returns the file with proper content-type', function(done) {
        client.get('/static/kolba.js', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(response.headers['content-type']).to.equal('application/javascript');
            done();
        });
    });
});
