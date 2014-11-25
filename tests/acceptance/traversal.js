var expect = require('expect.js');

var Client = require('../client');
var Kolba = require('kolba');

describe('Traversing the URL tree', function() {
    var app;
    var module;
    var client;
    var flag = false;

    function mk_app() {
        var app = new Kolba();

        app.resource('^/$', function() {
            return 'DERP';
        });

        app.afterRequest(function() {
            flag = true;
        });

        return app;
    }

    before(function() {
        app = mk_app();
        module = new Kolba();

        module.resource('/hi', function () {
            return 'Hola';
        });

        // What happens with the interceptors when a module is mounted?
        // In which order are `beforeRequest`s and `postMortem`s executed?
        // If both the app and the module define an interceptor for the same
        // code, how do we decide which one takes preference?
        //
        // DECISION: They are all simply ignored.
        app.mount('/mod', module);
        app.useMiddlewares(module);
        app.useInterceptors(module);

        app.listen(3001);

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('the module is found under mount point', function(done) {
        client.get('/mod/hi', function(response, body) {
            expect(body).to.equal('Hola');
            expect(response.statusCode).to.be(200);
            done();
        });
    });
});
