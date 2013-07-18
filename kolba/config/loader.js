var defaults = require('./defaults');

function Config(object) {
    var settings = {};

    this.fromObject = function(object) {
        var key;

        for (key in object) {
            if (object.hasOwnProperty(key)) {
                settings[key] = object[key];
            }
        }
    };

    this.get = function(key, defaultValue) {
        var value = settings[key];

        if (typeof(value) === 'undefined') {
            value = defaultValue;
        }

        return value;
    };

    this.fromObject(defaults);

    if (typeof(object) !== 'undefined') {
        this.fromObject(object);
    }
}

module.exports = Config;
