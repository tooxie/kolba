Kolba.Braindump
===============

Here I will write many ideas I have for a future version of Kolba. They will be
focused on the easing the developer's workflow. No code sharing between server
and client for now.


Modules
-------

Must be extremely modular, it should be possible to develop independent (and
distributable) modules/apps/blueprints. The idea is that each module defines
it's own HTML/CSS/JS and the framework gathers that info and constructs the
response. That way with only commenting out a module the css for it gets
removed.

kolba-module.js:
```javascript
var kolba = require('kolba');
var app = new kolba.app();

// Relative to this file's location
app.styles.add([
    'herp.less',
    'derp.css'
]);

app.resource('^/$', function() { ... });
```

index.js:
```javascript
var kolba = require('kolba');
var app = new kolba.app();
var module = require('kolba-module');

app.mount('^/mod/', module);

app.styles.add([
    'generic_styles.css'
]);
```


Minfying
--------

The framework will take care of transpiling less files and minifying styles
and javascript files.

First needs to be configured:
```javascript
app.config['MINIFIED_DIR'] = 'minified';
app.config['MINIFIED_URL'] = '/static';

// What about allowing environment variables as well?
app.config['MINIFIED_DIR'] = '$HOME/static';
```

Kolba will request each module the files that they need, in order to build the
response:
```javascript
for (module in this.modules) {
    // The actual code doesn't matter, the idea is that the modules know what
    // they need and they inform kolba.
    js.append(module.getJS());
    css.append(module.getCSS());
}
```

And then from the command line:
```shell
$ kolba deploy
```

That command would minify all the css files together and append the md5 hash of
the minified file in order to invalidate cache on changes and reuse cached
versions when possible.
```html
<head>
    <!-- /static comes from app.config.MINIFIED_URL -->
    <link rel="stylesheet" type="text/css" href="/static/styles.min-hashoftheminifiedfile.css">
</head>
```

In the disk, this would look like `./styles.min-hashoftheminifiedfile.css`. But
on development the files would be unprocessed, unminified:
```shell
$ kolba run

Listening on http://127.0.0.1:7331/
```

In the HTML:
```html
<head>
    <link rel="stylesheet" type="text/css" href="generic_styles.css">
    <link rel="stylesheet" type="text/css" href="derp.css">
    <link rel="stylesheet/less" type="text/css" href="herp.less">
    <script type="text/javascript" src="less.js"></script>
</head>
```

Add extra css per-url maybe?
```javascript
app.resource('/derpina/', function(response) {
    response.styles.add([
        'derpina.css'
    ]);

    return response;
});
```

This wouldn't get minified together with the global styles:
```html
<head>
    <link rel="stylesheet" type="text/css" href="styles.min.css?hashoftheminifiedfile">
    <link rel="stylesheet" type="text/css" href="derpina.min.css">
</head>
```

We could watch for changes and run the minification process automatically.

How would we include that in the HTML while keeping the framework
template-agnostic? It could require a small adapter that given a template
engine, we augment the options with a call to `app.css.asHTML();` and place it
in the global namespace:
```javascript
app.config['templateEngine'] = 'Jinja';
app.template.render('template_name.html', options);
```

In the template:
```html
<head>
    {{ kolba.css }}
</head>
```

Could it be possible to do the same with icons? What about sprites? Something
like:
```javascript
app.sprite.add({
    "bundesliga": {
        "herta": "static/gfx/hertha.png"
    }
});

app.config['WEBFONTS_PREFIX'] = 'icon-';
app.webfonts.add({
    "burger": "path/to/fonts/burger.svg"
});
app.webfonts.resource('^/fonts$');

// Maybe we can read them directly from a dir instead
app.fontsResource('^/fonts$', '/static/fonts');
```

In the CSS:
```less
.bundesliga {
    .hertha {
        {{ kolba.sprites.bundesliga.hertha }}

        /* That will translate to:
         *
         * background-position: -14px 377px;
         * width: 60px;
         * height: 60px;
         *
         * Assuming that those are the dimensions and coordinates of that
         * image in the sprite.
         */
    }
}
```

The template will look like:
```html
<head>
    <link rel="stylesheet" type="text/css" rel="stylesheet" href="/static/css/styles.css">
    <link rel="stylesheet" type="text/css" rel="stylesheet" href="/fonts">
</head>

<body>
    <header>
        <!-- We use the icon defined in app.webfonts -->
        <span class="icon-burger"></span>
    </header>

    <div class="bundesliga">
        <!-- This gets the styles from app.sprites.bundesliga -->
        <div class="hertha">
        </div>
    </div>
</body>
```

And when we run `kolba deploy` it gets replaced by `-177px 344px`.


JavaScript
----------

In the process of minifying JavaScript files we could also check for leaking
and conflicting globals. Would that be possible?
