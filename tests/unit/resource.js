var expect = require('expect.js');
var Resource = require('kolba/resource');

describe('Resource', function() {
    before(function() {
        var userRegExp = '^/user/(?<uid>[0-9]+)/$';

        this.homeResource = new Resource('^/$', function() {
            return true;
        }, ['GET'], 'text/html')

        this.userResource = new Resource(userRegExp, function(uid) {
            return userId;
        }, ['GET'], 'text/html')
    });

    it('matches a path', function() {
        var hre = this.homeResource.getRegExp();
        var ure = this.userResource.getRegExp();

        expect(hre.test('/')).to.be(true);
        expect(hre.test('/home')).to.be(false);

        expect(ure.test('/user/1/')).to.be(true);
        expect(ure.test('/user/18/')).to.be(true);
        expect(ure.test('/home')).to.be(false);
    });

    it('parses URL correctly', function () {
        var resource = this.userResource;
        var params;

        expect(resource.matchesURL('/user/18/')).to.be(true);

        params = resource.getUrlArgs();
        expect(params.uid).to.equal('18');
    });
});
