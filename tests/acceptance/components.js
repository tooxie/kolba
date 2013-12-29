var expect = require('expect.js');
var Kolba = require('kolba');

var Client = require('../client');

describe('Module', function() {
    var app;
    var client;

    before(function() {
        var mod = new Kolba.App({
            "ContentType": "text/plain"
        });
        app = new Kolba.App({
            "ContentType": "text/html"
        });

        mod.resource('/url', function() {
            return 'MOD';
        });

        /* Components being mounted should receive the global config, but also
         * should be able to redefine whatever they need. When you mount them
         * the app.config object gets populated with the parent app's config
         * but then overwritten with local configs.
         */
        app.mount('/mod/', mod);

        app.resource('/', function() {
            return 'APP';
        });

        app.run(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('is mounted and responding', function(done) {
        client.get('/mod/url', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(response.headers['content-type']).to.equal('text/plain');
            expect(body).to.equal('MOD');
            done();
        });
    });
});
