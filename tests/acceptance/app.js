var Kolba = require('kolba');
var expect = require('expect.js');
var Client = require('../client');

describe('Kolba app', function() {
    before(function() {
        this.app = new Kolba.App();

        this.app.resource('/', function() {
            return 'Home';
        });

        this.app.listen(3001);

        this.client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        this.app.stop();
    });

    it('does not allow to PUT', function(done) {
        this.client.put('/', function(response, body) {
            expect(response.statusCode).to.equal(405);
            expect(response.headers['allow']).to.equal('GET, HEAD, OPTIONS');
            done();
        });
    });

    it('defaults to GET and text/html', function(done) {
        this.client.get('/', function(response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Home');
            expect(response.headers['content-type']).to.equal('text/html');
            done();
        });
    });
});
