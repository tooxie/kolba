var Header = function(name, value) {
    // var name;
    // var value;

    this.getName = function() {
        return name;
    };

    this.setName = function(newName) {
        name = newName;
    };

    this.getValue = function() {
        return value;
    };

    this.setValue = function(newValue) {
        value = newValue;
    };

    this.toString = function() {
        return name + ': ' + value;
    };

    this.asDict = function() {
        var _obj = {};
        _obj[name] = value;

        return _obj;
    };
};

module.exports = Header;
