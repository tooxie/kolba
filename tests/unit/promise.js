var expect = require('expect.js');

var util = require('kolba/util');
var Promise = require('kolba/promise');

describe('Promise', function() {
    describe('utility', function() {
        it('recognizes a promise', function() {
            var promise = Promise();

            expect(util.isPromise(promise)).to.be(true);
        });

        it('recognizes that a deferred is also a promise', function() {
            var deferred = Promise.defer();

            expect(util.isPromise(deferred.promise)).to.be(true);
            expect(util.isPromise(deferred)).to.be(false);
        });

        it('recognizes that an objects is not a promise', function() {
            var notPromise = {};

            expect(util.isPromise(notPromise)).to.be(false);
        });
    });
});
