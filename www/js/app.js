requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
      "app": "../app",
      "index": "../index"
    },
    "shim": {
        "jquery.cookie": ["jquery"]
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
