var parser = require('./util').acceptHeaderParser;

var headerDefaults = {
    'Accept': '*/*'
};

function Request(httpRequest) {
    this.path = httpRequest.url;
    this.method = httpRequest.method;

    this.httpRequest = httpRequest;
}

Request.prototype.getHttpRequest = function() {
    return this.httpRequest;
};

Request.prototype.get = function(key) {
    return this.httpRequest[key];
};

Request.prototype.acceptedTypes = function() {
    return parser(this.getHeader('Accept'));
};

Request.prototype.getHeader = function(name) {
    var value = this.httpRequest.headers[name.toLowerCase()];

    if (typeof(value) === 'undefined') {
        if (headerDefaults[name]) {
            return headerDefaults[name];
        }
    }

    return value;
};

module.exports = Request;
