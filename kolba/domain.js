var domainModule = require('domain');

function Domain() {
    this.domain = domainModule.create();
}

Domain.prototype.onError = function(callback) {
    this.domain.on('error', callback);
};

Domain.prototype.run = function(callback) {
    this.domain.run(callback);
};

Domain.prototype.add = function(obj) {
    this.domain.add(obj);
};

module.exports = Domain;
