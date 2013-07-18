// Inspired by and adapted from
// https://github.com/angular/angular.js/blob/master/src/auto/injector.js

function Injector(options) {

    // Class variables
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,\s*/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var extractArgumentNames = function(fn) {
        var fnCode = fn.toString().replace(STRIP_COMMENTS, '');
        var argDeclaration = fnCode.match(FN_ARGS);
        var argNames = argDeclaration[1].split(FN_ARG_SPLIT);

        return argNames;
    };

    this.inject = function(fn, context) {
        context = context || {};

        return function() {
            var argName;
            var args = [];
            var fnArgs = extractArgumentNames(fn);
            var len = fnArgs.length;

            for(var i = 0; i < len; i += 1) {
                argName = fnArgs[i];
                args.push(options[argName]);
            }

            return fn.apply(context, args);
        };
    };

    this.update = function(moreOptions) {
        var option;

        for (option in moreOptions) {
            if (moreOptions.hasOwnProperty(option)) {
                options[option] = moreOptions[option];
            }
        }
    };
}

module.exports = Injector;
