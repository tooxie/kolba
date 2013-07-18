var RequestLocals = require('kolba/locals');

function ConfigMock() {
    this.get = function(varName) {
        return 'DERP';
    }
}

function RequestMock(options) {
    options = options || {};
    var HEADERS = {
        'Accept': options.accept || '*/*'
    };

    this.getHeader = function(name) {
        return HEADERS[name];
    }

    this.setHeader = function(name, value) {
        HEADERS[name] = value;
    }
}

function ResponseMock(options) {
    options = options || {};
    var HEADERS = {
        'Content-Type': options.accept || 'text/html'
    };

    this.getHeader = function(name) {
        return HEADERS[name];
    }

    this.setHeader = function(name, value) {
        HEADERS[name] = value;
    }
}

module.exports = {
    Request: RequestMock,
    Response: ResponseMock,
    locals: new RequestLocals({
        config: new ConfigMock(),
        request: new RequestMock(),
        response: new ResponseMock()
    })
};
