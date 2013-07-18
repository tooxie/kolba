var Injector = require('kolba/injector');
var expect = require('expect.js');

describe('Injector', function() {
    before(function() {
        this.injector = new Injector({
            'a': 1,
            'b': 2,
            'c': 3
        });
    });

    it('injects no argument', function() {
        var injected = this.injector.inject(function() {
            expect(function () {
                return a;
            }).to.throwError();

            expect(function () {
                return b;
            }).to.throwError();

            expect(function () {
                return c;
            }).to.throwError();
        });

        injected();
    });

    it('injects one argument', function() {
        var injected = this.injector.inject(function(b) {
            expect(function () {
                return a;
            }).to.throwError();

            expect(function () {
                return b;
            }).to.not.throwError();
            expect(b).to.be(2);

            expect(function () {
                return c;
            }).to.throwError();
        });

        injected();
    });

    it('injects all arguments', function() {
        var injected = this.injector.inject(function(a, b, c) {
            expect(a).to.be(1);
            expect(b).to.be(2);
            expect(c).to.be(3);
        });

        injected();
    });
});
