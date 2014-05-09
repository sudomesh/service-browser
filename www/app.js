requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
      "app": "../app",
    },
    "shim": {
        "jquery.cookie": ["jquery"]
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
