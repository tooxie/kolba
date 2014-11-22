var Client = require('../client');
var expect = require('expect.js');
var Kolba = require('kolba');
var request = require('request');

xdescribe('Event', function() {
    var app;
    var client;
    var mainPostRequest;
    var mainPreRequest;
    var resourceCompleted;
    var resourcePostRequest;
    var resourcePreRequest;
    var responsePostFlush;
    var responsePreFlush;

    beforeEach(function() {
        mainPreRequest = false;
        mainPostRequest = false;
        resourcePreRequest = false;
        resourceCompleted = false;
        resourcePostRequest = false;
        responsePreFlush = false;
        responsePostFlush = false;
    });

    before(function(done) {
        app = new Kolba();
        app.resource('^/$', function() {});

        app.beforeRequest(function(locals) {
            var bus = locals.getBus();

            mainPreRequest = true;

            bus.channel('Main:postRequest').subscribe(function() {
                mainPostRequest = true;
            });

            bus.channel('Resource:preRequest').subscribe(function() {
                resourcePreRequest = true;
            });

            bus.channel('Resource:completed').subscribe(function() {
                resourceCompleted = true;
            });

            bus.channel('Resource:postRequest').subscribe(function() {
                resourcePostRequest = true;
            });

            bus.channel('Response:preFlush').subscribe(function() {
                responsePreFlush = true;
            });

            bus.channel('Response:postFlush').subscribe(function() {
                responsePostFlush = true;
            });
        });

        app.listen(3001).then(function() {
            done();
        });

        client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        app.stop();
    });

    it('Main:preRequest', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(mainPreRequest).to.be(true);
            done();
        });
    });

    it('Main:preRequest triggered even when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(mainPreRequest).to.be(true);
            done();
        });
    });

    it('Main:postRequest', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(mainPostRequest).to.be(true);
            done();
        });
    });

    it('Main:postRequest triggered even when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(mainPostRequest).to.be(true);
            done();
        });
    });

    it('Resource:preRequest', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(resourcePreRequest).to.be(true);
            done();
        });
    });

    it('Resource:preRequest not triggered when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(resourcePreRequest).to.be(false);
            done();
        });
    });

    it('Resource:completed', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(resourceCompleted).to.be(true);
            done();
        });
    });

    it('Resource:completed not triggered when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(resourceCompleted).to.be(false);
            done();
        });
    });

    it('Resource:postRequest', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(resourcePostRequest).to.be(true);
            done();
        });
    });

    it('Resource:postRequest not triggered when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(resourcePostRequest).to.be(false);
            done();
        });
    });

    it('Response:preFlush', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(responsePreFlush).to.be(true);
            done();
        });
    });

    it('Response:preFlush triggered even when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(responsePreFlush).to.be(true);
            done();
        });
    });

    it('Response:postFlush', function(done) {
        client.get('/', function(response, body) {
            expect(response.statusCode).to.be(200);
            expect(responsePostFlush).to.be(true);
            done();
        });
    });

    it('Response:postFlush triggered even when 404', function(done) {
        client.get('/notfo', function(response, body) {
            expect(response.statusCode).to.be(404);
            expect(responsePostFlush).to.be(true);
            done();
        });
    });
});
