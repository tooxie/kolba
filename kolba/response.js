var Header = require('./header');

function Response(stateObject) {
    // This should be private attributes, but to take advantage of V8
    // optimizations I made them public. Is there a workaround for this?
    this.headers = {};
    this.statusCode = 200;
    this.id = '';
    this.body = '';

    if (typeof(stateObject) !== 'undefined') {
        this.update(stateObject);
    }

    if (!this.hasHeader('X-Powered-By')) {
        this.setHeader('X-Powered-By', 'Kolba');
    }
}

Response.prototype.setId = function(newId) {
    this.id = newId;
};

Response.prototype.getId = function() {
    return this.id;
};

Response.prototype.setHeader = function() {
    var header;

    // XXX: Maybe delegate this logic to the Header itself?
    switch (arguments.length) {
        case 1:
            header = arguments[0];
            if (!(header instanceof Header)) {
                throw new Error('Must be an instance of kolba.Header');
            }
            break;
        case 2:
            header = new Header(arguments[0], arguments[1]);
            break;
        default:
            throw new Error('Please provide valid arguments');
    }

    this.headers[header.getName()] = header;

    return header;
};

Response.prototype.getHeader = function(name) {
    return this.headers[name];
};

Response.prototype.setHeaders = function(headerDict) {
    var name;
    var header;

    for (name in this.headerDict) {
        header = this.headerDict[name];
        if (header instanceof Header) {
            this.setHeader(header);
        } else {
            this.setHeader(name, header);
        }
    }
};

Response.prototype.getHeaders = function() {
    return this.headers;
};

Response.prototype.hasHeader = function(headerName) {
    var name;

    for (name in this.headers) {
        if (name === headerName) {
            return true;
        }
    }

    return false;
};

Response.prototype.getHeadersAsString = function() {
    var _headers = '';
    var name = '';

    for (name in this.headers) {
        _headers += name + ': ' + this.headers[name].getValue() + '\n';
    }

    return _headers;
};

Response.prototype.getStatusCode = function() {
    return this.statusCode;
};

Response.prototype.setStatusCode = function(code) {
    this.statusCode = code;
};


// Body

Response.prototype.setBody = function(html) {
    this.body = html;
};

Response.prototype.getBody = function() {
    return this.body;
};

Response.prototype.update = function(object) {
    if (object instanceof Response) {
        this.setHeaders(object.getHeaders());
        this.setBody(object.getBody());
    } else if (typeof(object) === 'number') {
        this.setStatusCode(object);
    } else if (typeof(object) === 'string') {
        this.setBody(object);
    } else {
        this.setBody(JSON.stringify(object));
    }
};

Response.prototype.setContentType = function(newType) {
    this.setHeader('Content-Type', newType);
};

Response.prototype.toString = function() {
    return this.getHeadersAsString() + '\n' + this.getBody();
};

module.exports = Response;
