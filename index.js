// Globals
kolba = {
    clear: function(id) {
        kolba[id] = null;
        delete(kolba[id]);
    }
};

var app = require('express')();
var util = require('util');
var uuid = require('node-uuid');
var views = require('./views');

app.get('/', function(req, res) {
    var _uuid = uuid.v1();

    req.id = _uuid;
    res.id = _uuid;
    kolba[_uuid] = {};
    kolba[_uuid].request = req;
    kolba[_uuid].response = res;
    kolba[_uuid].timestamp = new Date().getTime();

    setTimeout(function() {
        // console.log('uuid %s == %s ? %s!', _uuid, req.id, (_uuid == req.id ? 'true' : 'false'));
        console.log(util.inspect(process.memoryUsage()));
        setTimeout(function() {
            kolba.clear(_uuid);
            // console.log(util.inspect(kolba));
        }, 500);
    }, 4000);

    // res.end();
    res.send(views.index(_uuid));
});

console.log('Server running on http://localhost:3000');
app.listen(3000);
