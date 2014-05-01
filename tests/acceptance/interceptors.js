var Kolba = require('kolba');
var expect = require('expect.js');
var Client = require('../client');

describe('Kolba defaults', function() {
    before(function() {
        this.app = new Kolba.App();

        this.app.resource('^/$', function() {
            return 'Home';
        });

        this.app.on(200, function(response) {
            response.setBody('Gotcha!');

            return response;
        });

        this.app.listen(3001);

        this.client = new Client('http://127.0.0.1:3001');
    });

    after(function() {
        this.app.stop();
    });

    it('for a view are GET and text/html', function(done) {
        this.client.get('/', function(response, body) {
            console.log('\n%s\n', response.statusCode);

            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Gotcha!');
            expect(response.headers['content-type']).to.equal('text/html');
            done();
        });
    });
});
