/*
 * This could also be sent to the client. If we assume that every route that
 * defaults to ['GET'] and 'text/html' (may be configurable) can be executed
 * also in the client, then we can reuse the router.
 */
function Router() {
    /*
       Root()
       Resource('/', function() {}, children=[
          Resource('
       ])

       /
       /herp/derp/<id>/
       /about/
       ResourceNode({
           "mountPoint": "/",
           "resource": function() {},
           "children": [
               ResourceNode({
                   "mountPoint": "herp",
                   "children": [
                       ResourceNode({
                           "mountPoint": "derp",
                           "children": [
                               Node({
                                   "mountPoint": "<id>",
                                   "resource": function() {}
                               })
                           ]
                       })
                   ]
               }),
               ResourceNode({
                   "mountPoint": "about",
                   "resource": function() {}
               })
           ]
       })

        /
        /herp/derp/
        {
            "/": {
                "resource": Resource(),
                "children": {
                    "herp": {
                        "children": {
                            "derp": {
                                "resource": Resource()
                            }
                        }
                    }
                }
            }
        }

    /
    /derp/
    /herp/derp/
    {
        "__root__": Resource,
        "derp": Resource,
        "herp": {
            "derp": Resource,
        }
    }
    */
    var resourceTree = {};

    // Public methods
    this.addRoute = function(resource) {
        var mPoint = resource.getMountPoint();

        if (typeof(resourceTree[mPoint]) === 'undefined') {
            resourceTree[mPoint] = resource;
        } else {
            resourceTree[mPoint].update(resource);
        }
    };

    this.dispatch = function(locals) {
        var accept = locals.getAcceptedTypes();
        var request = locals.getRequest();
        var dispatched = false;
        var header;
        var mountPoint;
        var resource;

        locals.updateResponse(404);
        // Iterate over the resourceTree
        for (mountPoint in resourceTree) {
            // Did anybody flush already?
            resource = resourceTree[mountPoint];
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
