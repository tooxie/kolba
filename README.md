Kolba
=====

A framework that shares your beliefs

[![Build status](http://img.shields.io/travis/tooxie/kolba/master.svg?style=flat-square)](https://travis-ci.org/tooxie/kolba)
[![Test coverage](http://img.shields.io/coveralls/tooxie/kolba/master.svg?style=flat-square)](https://coveralls.io/r/tooxie/kolba)


Kolba is simple
---------------

```javascript
var Kolba = require('kolba');
var app = new Kolba();

app.resource('^/$', function() {
    return 'Hello Kolba!';
});

app.run(3000);
```

Kolba is a simple web framework for nodeJS, heavily influenced by
[flask](http://flask.pocoo.org/). Aims to provide the structure lacking in
frameworks like [express](http://expressjs.com/) without the opinions baked in
libraries like [Rendr](https://github.com/airbnb/rendr).


Installation
------------

* Install:

```
npm install kolba
```

* And use:

```
% node
> var Kolba = require('kolba')
undefined
```


Big fat disclaimer
------------------

**This is experimental, Kolba is not production ready.**

Kolba uses some Node features that are not documented and may not be supported
any more in the future. Play around with it, but do not even think about using
it for anything real.


Defining resources
------------------

Resources consist of:

* A regular expression
* A callback
* A list of methods (optional)
* A string defining the returned content type (optional)

This is how you would define a resource:

```javascript
var Kolba = require('kolba');
var app = new Kolba();

app.resource('^/$', function() {
    return 'Hello Kolba!';
}, ['GET'], 'text/plain');

app.run(3000);
```

### The path ###

The syntax for the regexp used to match the path is defined by
[XRegExp](http://xregexp.com/), an **amazing** library created by
[Steven Levithan](http://blog.stevenlevithan.com/).

Thanks to XRegExp we can name groups and use them as callback parameters:

```javascript
app.resource('^/user/(?<uid> [0-9]\+)/$', function(uid) {
    return 'Hello user #' + uid + '!';
}, ['GET'], 'text/plain');
```


### The callback ###

Callbacks use a simplified version of
[AngularJS' dependency injection](http://docs.angularjs.org/guide/di). Any of
your callbacks can use the following objects just by declaring it in the
signature:

* `request`: A [Request](#request) object.
* `response`: A [Response](#response) object.
* `locals`: A [RequestLocals](#requestlocals) object.


### Methods ###

A list of the methods your resource understands. Should be any of:

* DELETE
* GET
* HEAD
* OPTIONS
* POST
* PUT

You don't have to implement the `HEAD` and `OPTIONS` methods, they will be
appended to the list and managed automatically by Kolba.

Defaults to `['GET', 'HEAD', 'OPTIONS']`.


### Content Type ###

The last parameter is a string defining the content type that your resource
returns. This is used to find a suitable callback for a given request. You can
avoid setting this explicitly if you define it in Kolba's constructor:


```javascript
var Kolba = require('kolba');
var app = new Kolba({
    'contentType': 'text/plain'
});

app.resource('^/$', function() {
    return 'Hello Kolba!';
});
```

In this example every resource that doesn't specify explicitly a content type
will be treated as `text/plain`.

Defaults to `text/html`.


Static resources
----------------

To serve static files from a directory there is a special type of resource that
receives a mount point and a directory:

```javascript
app.static('/js', 'static/js');
```

It will serve only `GET` requests, and content-types will be guess using
[node-mime](https://github.com/broofa/node-mime).
```
% curl -v "http://127.0.0.1:3000/js/kolba.js"
* About to connect() to 127.0.0.1 port 3000 (#0)
*   Trying 127.0.0.1... connected
> GET /js/kolba.js HTTP/1.1
> User-Agent: curl/7.22.0 (x86_64-pc-linux-gnu) libcurl/7.22.0 OpenSSL/1.0.1 zlib/1.2.3.4 libidn/1.23 librtmp/2.3
> Host: 127.0.0.1:3000
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Kolba
< Content-Type: application/javascript

(...)
```

This is available for development purposes, but it should **not** be used in
production. Use a specific web server like apache or nginx to serve your static
files, not your application server.

This is a very naive implementation, it is not safe to use live.


Accept-header-based resources
-----------------------------

I need a shorter name for this, but the concept is very simple; as was
mentioned before, a resource consists of:

* A URL
* A callback
* A list of methods
* The content type it returns

An example is worth a thousand words:

```javascript
var Kolba = require('kolba');
var app = new Kolba();

app.resource('^/$', function() {
    return 'Hello Kolba!';
}, ['GET'], 'text/plain');

app.resource('^/$', function() {
    return {"Hello": "Kolba!"};
}, ['GET'], 'application/json');

app.run(3000);
```

Note that both resources are mounted under the same path and respond to the
same methods. Let's issue a request:

```
% curl -v http://127.0.0.1:3000/
* About to connect() to 127.0.0.1 port 3000 (#0)
*   Trying 127.0.0.1... connected
> GET / HTTP/1.1
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Kolba
< Content-Type: text/plain; charset=utf-8
<
Hello Kolba!

```

Now let's add the `Accept: application/json` header to tell the server that we
want a JSON response this time:

```
% curl -v http://127.0.0.1:3000/ -H "Accept: application/json"
* About to connect() to 127.0.0.1 port 3000 (#0)
*   Trying 127.0.0.1... connected
> GET / HTTP/1.1
> Accept: */*
>
< HTTP/1.1 200 OK
< X-Powered-By: Kolba
< Content-Type: application/json
<
{"Hello": "Kolba!"}

```

When Kolba receives a request, reads the
[Accept header](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.1)
sent by the browser and picks the callback that understands that format.


### So what? ###

This way of defining resources allows you to have one URL return different
formats. When you request a resource using a web browser, you will get an HTML
representation of the content, but when your single page application (SPA)
kicks in, it will request the information in JSON format.

Some examples:

```javascript
app.resource('^/users$', function() {
    // Generate full HTML page

    return html;
}, ['GET'], 'text/html');

app.resource('^/users$', function() {
    // Generate partial HTML for AHAH/PJAX use

    return partial;
}, ['GET'], 'ajax/html');

app.resource('^/users$', function() {
    // Just send the raw data as JSON

    return json;
}, ['GET'], 'application/json');
```

That way your pages will be rendered in the server on the first hit, and the
consecutive renders will be done in the client.

You can (and should) abstract the common logic away. The JSON object generated
by the last resource, for example, could be fed into any of the HTML resources
to generate their templates.


Return codes
------------

This table shows clearly which status code will be returned when looking up the
correct resource for a given request:

```
+--------+--------+--------+--------+
| Path   | Method | Accept | Code   |
+--------+--------+--------+--------+
| false  | false  | false  | 404    |
| false  | false  | true   | 404    |
| false  | true   | false  | 404    |
| false  | true   | true   | 404    |
| true   | false  | false  | 405    |
| true   | false  | true   | 405    |
| true   | true   | false  | 406    |
| true   | true   | true   | 200    |
+--------+--------+--------+--------+
```


Middlewares
-----------

You can control when you middlewares get executed: as soon as a request is
received or right before it gets sent to the client.

```javascript
app.beforeRequest(function(request) {
    // do something
});

app.resource('^/$', function() {
    return 'Yo!';
});

app.afterRequest(function(response) {
    // do something else
});
```


### Request middlewares ###

You can define request middlewares with the `app.beforeRequest()` method. When
a request comes, this is the first thing that gets executed.

Every middleware is executed asynchronously, but not in parallel. Only when one
has finished, the next one starts. But if one returns a value different from
`undefined` the execution is aborted and whatever was returned gets sent to the
client:

```javascript
app.beforeRequest(function(response) {
    response.setStatusCode(451);
    response.setBody('Unavailable for legal reasons');

    return response
});

app.resource('^/$', function() {
    // This will never get executed
    return 'Yo!';
});
```


### Response middlewares ###

The `app.afterRequest()` method defines a response middleware:

```javascript
app.afterRequest(function(response) {
    response.setHeader('Content-Type', 'application/x-gzip');
    response.setBody(gzip(response.getBody()));

    return response
});
```

The response middlewares get called right before the response is sent to the
client. This lets you apply any transformation on the response, like this
example shows, which gzips the body.

Unlike the request middlewares, when a response middleware returns a value, the
execution won't be interrupted. Instead, the response will be updated with that
value and the next middleware will be called. This will happen asynchronously,
but it is also sequential.


Interceptors
------------

It is possible to intercept a response based on its status code:

```javascript
app.on(200, function(response) {
    return response.getBody() + '\n\n  -- Powered by Kolba';
});
```

**Note:** Be careful when modifying the body, make sure you are not breaking
the format that the resource returned.

This allows you to define handlers for errors in a consistent way:

**Note:** You can only set 1 interceptor per status code.

```javascript
app.on(404, function() {
    return 'Sorry, what?';
});

app.on(500, function() {
    return 'Something went terribly wrong';
});
```

Interceptors are called right before the response middlewares.


Post mortems
------------

If you want to execute a maintenance task after the response was sent to the
client, i.e. logging, use a `post mortem`:

```javascript
app.postMortem(function(response) {
    logging.logResponse(response);
});
```


How Kolba treats return values
------------------------------

Kolba embraces the dynamic nature of JavaScript and uses it to provide some
handy flexibility. There are 4 types of values your resources can return, which
will be treated differently.


### String ###

Will be treated as the body of the response.

```javascript
app.resource('^/$', function() {
    return 'Yo!';
});
```


### Integer ###

Will be treated as the resource's status code.

```javascript
app.resource('^/$', function() {
    // Magic happens here

    if (thingsWentWrong) {
        return 500;
    }
});
```

### Response object ###

Will be used as is.

```javascript
app.resource('^/$', function(response) {
    response.setBody('Yo!');

    return response;
});
```


### Promise object ###

Must resolve to any of the 3 types above.

```javascript
var Promise = require('kolba/promise');

app.resource('^/$', function() {
    var deferred = Promise.defer();

    process.nextTick(function() {
        deferred.resolve('Yo!');
    });

    return deferred.promise;
});
```

The `Promise` object is a thin wrapper around cujojs'
[when](https://github.com/cujojs/when). You can use any promise library
actually, as long as it complies with the
[Promises/A+ spec](http://promises-aplus.github.io/promises-spec/).

Any other object that doesn't match any of these will be simply serialized and
sent to the client.


### How Kolba treats Response objects ###

In every case, even when you return a `Response` object, the contents of it
will be used to update the original response, it won't overwrite it. Feel free
to instantiate a new `Response`, but keep in mind that when you return it, the
values that you didn't set explicitly won't be empty.

Say that you want to overwrite the `X-Powered-By` header:

```javascript
var Response = require('kolba/response');

app.resource('^/$', function() {
    var response = new Response();

    response.setBody('Hola');

    return response;
});
```

This won't remove it, because you didn't set a different one. If Kolba took the
response as is, you would need to redefine every single attribute manually.

```javascript
var Response = require('kolba/response');

app.resource('^/$', function() {
    var response = new Response();

    response.setHeader('X-Powered-By', 'Vegetables');
    response.setBody('Hola');

    return response;
});
```


Request
-------

The `Request` object will contain information about the request in progress.
Specifically, it contains the following public attributes:

* path
* method

And the following public methods:

* getHttpRequest
* get
* acceptedTypes
* getHeader

You can access the `Request` object from anywhere in your application simply by
running:

```javascript
var request = require('kolba').getCurrentRequest();
```

Read more about this in
[The magic behind getCurrentRequest()](#the-magic-behing-getcurrentrequest).


### httpRequest ###

This is the `Request` object generated by Node. Whenever you need an attribute
that it's not directly provided by Kolba's `Request` object, call the
`getHttpRequest()` method or `get('attributeName')`. This will get that
attribute from the original request object.


Response
--------

This object is just a representation of the response that will be sent to the
client. Unlike Node's `Response` object, this is not responsible for sending
the actual response to the client.

That will be done by the `RequestLocals` object.


Events
------

Thanks to node's [Domains](http://nodejs.org/api/domain.html), you can create
your own
[EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter)
object which will be automatically binded to the current request. That way you
don't have to worry about concurrency.

Usually when you have 2 (or more) concurrent requests being processed by the
same thread you have to be very careful that the events emitted in one of them
don't pollute the others. As you may already know, Node is single threaded,
which means that you have to handle this cases yourself. Kolba takes care of
that for you.


The magic behind getCurrentRequest()
------------------------------------

You may have noticed the following line already:

```javascript
var request = require('kolba').getCurrentRequest();
```

This allows you to access the request from any point in your application. Here
I will explain how it works.

In frameworks like
[flask](http://flask.pocoo.org/docs/quickstart/#accessing-request-data) you can
access the request information simply by importing it:

```python
from flask import request
```

That is possible because flask uses
[thread locals](http://flask.pocoo.org/docs/advanced_foreword/)
(provided by [Werkzeug's Context Locals](http://werkzeug.pocoo.org/docs/local/))
which is, basically, variables local to the current thread (but your
application will see them as globals). That's how flask knows which of the
current requests being processed you are asking for.

Node runs in a single thread, every incoming request will be served by the same
thread, so this is not possible. However, Node provides a mechanism to mimic
this behaviour, called [domains](http://nodejs.org/api/domain.html).

From Node's documentation:

> Domains provide a way to handle multiple different IO operations as a single
> group. If any of the event emitters or callbacks registered to a domain emit
> an error event, or throw an error, then the domain object will be notified,
> rather than losing the context of the error in the
> process.on('uncaughtException') handler, or causing the program to exit
> immediately with an error code.

In short, domains are a way to handle errors (and events in general) in a
simpler way. As a side effect, you can also store information which will be
globally accessible to the current domain. Your application will be sandboxed,
which allows Kolba to simulate a
[thread locals](http://en.wikipedia.org/wiki/Thread-local_storage) behaviour.

This is very useful not only because prevents different requests from polluting
each other (overwriting each other's variables) but also provides a mechanism
for intra-request communication, i.e. triggering events that will be only
delivered to listeners inside that same request.


### Cons ###

The problem with this approach is that if you use it, your application will be
relying on a global variable to function, and that
[can be bad](http://c2.com/cgi/wiki?GlobalVariablesAreBad).

You don't have to use it, though. You can ask for the request on your resource
and pass it around.

```javascript
app.resource('^/$', function(resource) {
    var view = new HomeView(resource);

    return view.render();
});
```

It's up to you.


### With great power... ###

**Don't inject information in the request object.** Don't treat it as a global
variable for you to store information. Treat it as immutable, read-only.

Remember that thanks to
[V8 optimizations](https://developers.google.com/v8/design) reusing objects is
very efficient, as long as you don't transform them at runtime. Kolba doesn't
currently support sessions, which would be the way for you to persist the state
of your application between requests. Use cookies for that.

Read more about
[Node's event loop](http://stackoverflow.com/questions/10680601/nodejs-event-loop#answer-11082422)
and
[V8's memory management](http://www.html5rocks.com/en/tutorials/memory/effectivemanagement/)
if you are interested in this subject.


Wish list
---------

* Modularized applications
* The end of hunger in the world
* A better slogan
* Benchmarks
* Sessions
