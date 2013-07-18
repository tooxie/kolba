var uuid = require('node-uuid');
var events = require('events');

var Injector = require('./injector');
var Request = require('./request');
var Response = require('./response');

function RequestLocals(args) {
    this.config = args.config;
    this.defaultContentType = args.config.get('contentType');
    this.emitter = new events.EventEmitter();
    this.flushed = false;
    this.httpResponse = args.response;
    this.id = uuid.v1();
    this.request = new Request(args.request);
    this.response = new Response();
    this.timestamp = new Date().getTime();

    this.response.setHeader('Content-Type', this.defaultContentType);

    this.injector = new Injector({
        'locals': this,
        'request': this.request,
        'response': this.response
    });
}

// Public methods
RequestLocals.prototype.getId = function() {
    return this.id;
};

RequestLocals.prototype.getEventEmitter = function() {
    return this.emitter;
};

RequestLocals.prototype.on = function(eventName, callback) {
    this.emitter.on(eventName, callback);
};

RequestLocals.prototype.emit = function(eventName) {
    console.log('Emitting ' + eventName + '...');
    this.emitter.emit(eventName, this);
};

RequestLocals.prototype.wasFlushed = function() {
    return this.flushed;
};

RequestLocals.prototype.flush = function() {
    var headers;
    var name;

    // Make this call idempotent
    if (this.wasFlushed()) {
        console.log('Ignoring flush call');
        return true;
    }

    this.emitter.emit('Response:preFlush', this);

    headers = this.response.getHeaders();
    this.httpResponse.statusCode = this.response.getStatusCode();

    for (name in headers) {
        this.httpResponse.setHeader(name, headers[name].getValue());
    }
    this.httpResponse.end(this.response.getBody());
    this.flushed = true;

    this.emitter.emit('Response:postFlush', this);
    // The locals object shouldn't know about Main, but this is handy
    // exception we can make here.
    this.emitter.on('Main:postRequest', function(locals) {
        locals.destroy();  // this
    });
};

RequestLocals.prototype.getRequest = function() {
    return this.request;
};

RequestLocals.prototype.getResponse = function() {
    return this.response;
};

RequestLocals.prototype.setResponse = function(newResponse) {
    this.response = newResponse;
};

RequestLocals.prototype.setContentType = function(newContentType) {
    this.response.setContentType(newContentType);
};

RequestLocals.prototype.updateResponse = function(responseState) {
    this.getResponse().update(responseState);
};

RequestLocals.prototype.getInjector = function() {
    return this.injector;
};

RequestLocals.prototype.getStatusCode = function() {
    return this.response.getStatusCode();
};

RequestLocals.prototype.getAcceptedTypes = function() {
    return this.request.acceptedTypes();
};

RequestLocals.prototype.destroy = function() {
    var id = this.getId();

    console.log('Clearing locals for id %s', id);

    if (!id) {
        return false;
    }

    this.config = null;
    this.defaultContentType = null;
    this.emitter = null;
    this.flushed = false;
    this.httpResponse = null;
    this.id = null;
    this.injector = null;
    this.request = null;
    this.response = null;
    this.timestamp = null;

    this.locals[id] = null;
    delete(this.locals[id]);
};

module.exports = RequestLocals;