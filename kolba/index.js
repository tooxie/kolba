// Kolba
// =====

// This is the application's entry point. When you `require` kolba, you will
// receive this dictionary with all the public objects.

function getLocals() {
    return process.domain.locals;
}

function getCurrentRequest() {
    return getLocals().getRequest();
}

// [App](main.html) is the object you will use to instantiate your application:
// ```javascript
// var Kolba = require('kolba');
//
// var app = new Kolba.App();
// ```
module.exports = {
    'App': require('./main'),
    'getCurrentRequest': getCurrentRequest,
    'getLocals': getLocals,
    'Header': require('./header'),
    'Promise': require('./promise'),
    'Request': require('./request'),
    'Resource': require('./resource'),
    'Response': require('./response')
};
