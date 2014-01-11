var domainModule = require('domain');

function Domain() {
    var domain = domainModule.create();

    this.onError = function(callback) {
        domain.on('error', callback);
    };

    this.run = function(callback) {
        // domain.run(domain.bind(callback));
        domain.run(callback);
    };

    this.add = function(obj) {
        domain.add(obj);
    };
}

module.exports = Domain;
