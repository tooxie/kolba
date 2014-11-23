var Node = require('./tree');

function Router() {
    var resources = {};
    var resourceTree = Node('/');

    // Public methods
    this.addRoute = function(resource) {
        var mPoint = resource.getMountPoint();

        if (typeof(resources[mPoint]) === 'undefined') {
            resources[mPoint] = resource;
        } else {
            resources[mPoint].update(resource);
        }
    };

    this.mount = function(mPoint, resourceTree) {
        var node = this.resourceTree.find(mPoint);

        node.attach(resourceTree);
    };

    this.getResourceTree = function() {
        return resourceTree;
    };

    this.dispatch = function(locals) {
        var request = locals.getRequest();
        var path = request.path.split('/');

        resourceTree.find(path);

        return;


        // -- MARK --
        var accept = locals.getAcceptedTypes();
        var request = locals.getRequest();
        var dispatched = false;
        var header;
        var mountPoint;
        var resource;

        locals.updateResponse(404);
        // Iterate over the resources
        for (mountPoint in resources) {
            // Did anybody flush already?
            resource = resources[mountPoint];
            // Does your URL definition matches this path?
            if (resource.matchesURL(request.path)) {
                locals.updateResponse(405);
                // Do you handle this method?
                if (resource.allowsMethod(request.method)) {
                    locals.updateResponse(406);
                    // Do you understand this format?
                    if (resource.acceptsType(accept, request.method)) {
                        locals.updateResponse(200);
                        // It's all yours
                        resource.takeOver(locals);
                        // And we set a flag announcing it was dispatched
                        dispatched = true;
                    }
                } else {
                    header = resource.getMethods().join(', ');
                    locals.getResponse().setHeader('Allow', header);
                }
            }
        }

        // Each resource emits a 'Resource:postRequest' event that flushes
        // the response. If no resource was found, that event was not emitted
        // and we need to do it manually.
        if (!dispatched) {
            locals.emit('Resource:completed');
            locals.emit('Resource:preRequest');
            locals.emit('Resource:postRequest');
        }
    };
}

module.exports = Router;
