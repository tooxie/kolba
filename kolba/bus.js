// This is the internal bus that communicates the components inside a request.
// For every request a bus is instantiated, which will be discarded as soon as
// the request dies.

// We use an [ObjectList](util.html#section-1) to maintain the list of
// subscribers to a given channel.
var ObjectList = require('./util').ObjectList;

// The `Channel` object
function Channel(name) {
    var subscribers = new ObjectList();

    this.publish = function() {
        var args = Array.prototype.slice.call(arguments);

        console.log('Publishing %s', name);

        subscribers.each(function(subscriber) {
            var callback;

            if(typeof(subscriber) === 'function') {
                subscriber.apply(subscriber, args);
            } else {
                callback = subscriber.object[subscriber.callback];
                callback.apply(subscriber.object, args);
            }
        });

        return true;
    };

    this.subscribe = function() {
        switch (arguments.length) {
            case 1:
                subscribers.append(arguments[0]);
                break;
            case 2:
                subscribers.append({
                    'object': arguments[0],
                    'callback': arguments[1]
                });
                break;
            default:
                throw new Error('Invalid arguments for subscribe');
        }

        return true;
    };

    this.getSubscribers = function() {
        return subscribers.getAll();
    };
}

function Bus(id) {
    var channels = {};

    this.channel = function(name) {
        var channel = channels[id][name];

        if (typeof(channel) === 'undefined') {
            channel = new Channel(name);
            channels[id][name] = channel;
        }

        return channel;
    };

    // Ununsed
    this.get = function(id) {
        return channels[id];
    };

    if (typeof(channels[id]) === 'undefined') {
        channels[id] = {};
    }
}

module.exports = Bus;
