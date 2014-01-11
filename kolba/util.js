// Utilities
// =========
//
// ObjectList
// ----------
//
// A list of Object.
function ObjectList(size) {
    var items = {};
    this.size = size;
    this.length = 0;

    this.append = function(item) {
        if (this.size === this.length) {
            throw new Error('ObjectList overflow');
        }

        items[this.length] = item;
        this.length++;

        return item;
    };

    this.get = function(index) {
        var key;
        var counter = 0;

        if (index >= this.length) {
            return undefined;
        }

        for (key in items) {
            if (counter === index) {
                return items[key];
            }

            counter += 1;
        }

        return undefined;
    };

    this.getAll = function() {
        return items;
    };

    this.each = function(callback, ctx) {
        var i = 0;

        if (this.length === 0) {
            return false;
        }

        while (i < this.length) {
            callback.call(ctx || this, items[i]);
            i += 1;
        }
    };

    this.remove = function(index) {
        var item;
        var key;
        var counter = 0;

        if (index >= length) {
            return undefined;
        }

        for (key in items) {
            if (counter === index) {
                item = items[key];

                items[index] = null;
                delete(items[index]);
                this.length -= 1;

                return item;
            }

            counter += 1;
        }

        return undefined;
    };

    this.pop = function() {
        return this.remove(this.length);
    };

    this.update = function(oList) {
        oList.each(function(item) {
            this.append(item);
        }, this);
    };
}

function getTypeAndQ(typeString) {
    var bits;
    var q;

    if (typeString.indexOf(';') > -1) {
        bits = typeString.split(';');
        q = bits[1].split('q=')[1];

        return {
            'type': bits[0],
            'q': parseFloat(q, 10)
        };
    }

    // q defaults to 1
    return {
        'type': typeString,
        'q': 1
    };
}

function UniqueList() {
    var items = {};
    this.length = 0;

    this.append = function(item) {
        var key;

        for (key in items) {
            if (item == items[key]) {
                return undefined;
            }
        }

        items[this.length] = item;
        this.length += 1;
    };

    this.concat = function(list) {
        var i;

        for (i in list) {
            this.append(list[i]);
        }
    };

    this.asArray = function() {
        var itemList = [];
        var key;

        for (key in items) {
            itemList.push(items[key]);
        }

        return itemList;
    };
}

var acceptHeaderParser = function(acceptString) {
    var _types = {};
    var types = new UniqueList();
    var bits = acceptString.split(',');
    var type;
    var i;
    var qList = [];
    var typeAndQ;
    var q;

    if (!acceptString) {
        return ['*/*'];
    }

    if (acceptString === '*/*' || acceptString.indexOf(',') === -1) {
        return [acceptString.split(';')[0]];
    }

    for (i in bits) {
        typeAndQ = getTypeAndQ(bits[i]);

        type = typeAndQ.type;
        q = typeAndQ.q.toString();

        if (q > 1) {
            throw new Error('Invalid q for type "' + type + '"');
        }

        qList.push(typeAndQ.q);

        if (typeof(_types[q]) === 'undefined') {
            _types[q] = [type];
        } else {
            _types[q].push(type);
        }
        // _types[q] = !!_types[q] ? _types[q].push(type) : [type];
    }

    qList = qList.sort();
    qList = qList.reverse();

    var prev = 0;
    for (i in qList) {
        if (prev !== qList[i]) {
            q = qList[i].toString();
            types.concat(_types[q]);
            prev = qList[i];
        }
    }

    return types.asArray();
};

function isPromise(object) {
    return object && typeof object.then === 'function';
}

module.exports = {
    acceptHeaderParser: acceptHeaderParser,
    isPromise: isPromise,
    ObjectList: ObjectList
};
