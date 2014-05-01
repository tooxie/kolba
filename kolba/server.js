var http = require('http');

var Promise = require('./promise');

function Server(port) {
    var server;

    this.listen = function(requestHandler) {
        var deferred = Promise.defer();

        process.nextTick(function() {
            server = http.createServer(requestHandler);
            server.listen(port);

            deferred.resolve(server);
        });

        return deferred.promise;
    };

    this.stop = function() {
        server.close();
    };
}

module.exports = Server;
