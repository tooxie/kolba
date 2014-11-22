// Kolba
// =====
var Kolba = require('./app');

// This is the application's entry point. When you `require` kolba, you will
// receive a Kolba object with 2 helpers functions in the prototype.

Kolba.prototoype = Kolba.prototoype || {};
Kolba.prototoype.getLocals = function getLocals() {
    return process.domain.locals;
};

Kolba.prototoype.getCurrentRequest = function getCurrentRequest() {
    return this.getLocals().getRequest();
};

// [Kolba](main.html) is the object you will use to instantiate your application:
// ```javascript
// var Kolba = require('kolba');
//
// var app = new Kolba();
// ```
module.exports = Kolba;
