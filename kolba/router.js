/*
 * This could also be sent to the client. If we assume that every route that
 * defaults to ['GET'] and 'text/html' (may be configurable) can be executed
 * also in the client, then we can reuse the router.
 */
function Router() {
    var resources = {};

    // Public methods
    this.addRoute = function(resource) {
        var mPoint = resource.getMountPoint();

        if (typeof(resources[mPoint]) === 'undefined') {
            resources[mPoint] = resource;
        } else {
            resources[mPoint].update(resource);
        }
    };

    this.dispatch = function(locals) {
        var accept = locals.getAcceptedTypes();
        var request = locals.getRequest();
        var header;
        var mountPoint;
        var resource;

        console.log('Dispatching...');

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
        if (locals.getStatusCode() !== 200) {
            locals.emit('Resource:preRequest');
            locals.emit('Resource:postRequest');
        }
    };
}

module.exports = Router;
