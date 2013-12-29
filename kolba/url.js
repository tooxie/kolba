function ParserFactory() {
}

function Node() {
    var callback;
    var children = {};
    var methods;
    var name = '';
    var type;
    var resource;

    if (arguments.length === 1) {
        name = arguments[0];
    } else if (arguments.length === 3) {
        callback = arguments[0];
        methods = arguments[1];
        type = arguments[2];
    }

    this.insert = function(path, node) {
        var slash = -1;

        path = path.replace(/^\/+/, '');
        slash = path.indexOf('/');
        name = path.substr(0, slash || path.length);

        if (slash === -1 || slash === path.length - 1) {
            resource = node;

            return this;
        } else {
            var _node = new Node(name);

            children[name] = _node;

            return _node.insert(path.substr(slash + 1), node);
        }
    }

    this.getChildren = function() {
        return children;
    };

    this.getResource = function() {
        return resource;
    };

    this.getName = function() {
        return name;
    };
}

module.exports = Node;
