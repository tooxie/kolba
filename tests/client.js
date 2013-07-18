var request = require('request');

/* TODO: Make this a little more generic */
function Client(serverURI) {
    this.get = function(path, callback) {
        if (typeof(path.headers) !== 'undefined') {
            if (path.headers.constructor.name === 'Array') {
                // For some reason...
                throw new Error('Headers are not supposed to be arrays');
            }
        }
        if (typeof(path) === 'object') {
            path.url = serverURI + path.url;
        } else if (typeof(path) === 'string') {
            path = serverURI + path
        }
        request(path, function(error, response, body) {
            if (error) {
                process.stdout.write('\nERR: ');
                console.log(error);
            }
            callback(response, body);
        })
    };

    this.put = function(path, callback) {
        if (typeof(path.headers) !== 'undefined') {
            if (path.headers.constructor.name === 'Array') {
                // For some reason...
                throw new Error('Headers are not supposed to be arrays');
            }
        }
        if (typeof(path) === 'object') {
            path.url = serverURI + path.url;
        } else if (typeof(path) === 'string') {
            path = serverURI + path
        }
        request.put(path, function(error, response, body) {
            if (error) {
                process.stdout.write('\nERR: ');
                console.log(error);
            }
            callback(response, body);
        })
    }
}

module.exports = Client;
