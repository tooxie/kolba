var ObjectList = require('./util').ObjectList;

var callbacks = new ObjectList();

function PostMortem() {}

// Public methods
PostMortem.prototype.append = function(callback) {
    callbacks.append(callback);
};

PostMortem.prototype.run = function(locals) {
    var injector;

    if (callbacks.length === 0) {
        return undefined;
    }

    injector = locals.getInjector();

    console.log('Running post mortem tasks');

    callbacks.each(function(callback) {
        process.nextTick(function() {
            injector.inject(callback)();
        });
    });
};

module.exports = PostMortem;
