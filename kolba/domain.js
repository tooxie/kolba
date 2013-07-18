var domainModule = require('domain');

function Domain() {
    var domain = domainModule.create();

    this.onError = function(callback) {
        domain.on('error', callback);
    };

    this.run = function(callback) {
        domain.run(callback);
    };
}

module.exports = Domain;
