var expect = require('expect.js');

var Client = require('../client');
var Kolba = require('kolba');

describe('afterRequest', function() {
    var app;
    var client;
    var flag = false;

    before(function() {
        app = new Kolba.App();

        app.resource('^/$', function() {
            return 'DERP';
        });

        app.afterRequest(function() {
            flag = true;
        });

        app.run(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('gets executed', function() {
        client.get('/', function(response, body) {
            expect(flag).to.be(true);
        });
    });
});
