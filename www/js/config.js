requirejs.config({
    baseUrl: "js",
    paths: {
        app: "./app",
        template: "../templates",
        sockjs: "../bower_components/sockjs/sockjs",
        json2: "../bower_components/json2/json2",
        "jquery.cookie": "../bower_components/jquery.cookie/jquery.cookie",
        handlebars: "../bower_components/handlebars/handlebars",
        bootstrap: "../bower_components/bootstrap/dist/js/bootstrap",
        requirejs: "../bower_components/requirejs/require",
        jquery: "../bower_components/jquery/dist/jquery",
        lodash: "../bower_components/lodash/dist/lodash.compat"
    },
    shim: {
        "jquery.cookie": [
            "jquery"
        ]
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);