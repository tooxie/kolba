var _ = require('lodash');

function Node(name, data) {
    this._name = name;
    this._data = data;
    this.children = [];
    this.parent = undefined;
}

Node.prototoype = {};

Node.prototoype.addChild = function(node) {
    var found = _.contains(this.children, node);

    if (!found) {
        this.children = this.children.concat(node);
    }
};

Node.prototoype.removeChild = function(node) {
    var found = _.contains(this.children, node);

    if (found) {
        _.pull(this.children, node);
    }
}

Node.prototoype.find = function(path) {
    var node = _.find(this.children, function(child) {
        return child.match(path);
    });
};

module.exports = Node;
