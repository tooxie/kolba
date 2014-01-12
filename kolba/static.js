var XRegExp = require('xregexp').XRegExp;
var fs = require('fs');
var mime = require('mime');

function StaticResource(mountPoint, path) {
    this.mountPoint = mountPoint;
    this.path = path;
    this.methods = ['GET'];
    this.re = XRegExp('^' + mountPoint, 'x');
}

StaticResource.prototype.getMountPoint = function() {
    return this.mountPoint;
};

StaticResource.prototype.update = function() {
    throw new Error('Static resources are not updateable');
};

StaticResource.prototype.matchesURL = function(path) {
    var matches = XRegExp.exec(path, this.re);

    return matches !== null;
};

StaticResource.prototype.allowsMethod = function(method) {
    return this.methods.indexOf(method) > -1;
};

StaticResource.prototype.acceptsType = function(type) {
    return true;
};

StaticResource.prototype.getMethods = function() {
    return this.methods;
};

StaticResource.prototype.takeOver = function(locals) {
    var dir;
    var path = this.path + '/' + locals.getRequest().path.substr(this.mountPoint.length);

    path = path.replace('//', '/');

    for (dir in path.split('/')) {
        if (dir[0] === '.') {
            locals.updateResponse(404);

            complete(locals);
            return;
        }
    }

    fs.readFile(path, function(err, data) {
        if (err) {
            locals.updateResponse(404);
        } else {
            locals.setContentType(mime.lookup(path));
            locals.updateResponse('' + data);
        }

        complete(locals);
    });
};

var complete = function(locals) {
    locals.emit('Resource:completed', locals);
    locals.emit('Resource:postRequest', locals);
};

module.exports = StaticResource;
