
This is a web app for browsing services available on the [People's Open Network](https://peoplesopen.net/).

It is a simple node.js/express based web app that uses mDNS/DNS-SD to listen for services and informs the web clients about them using websockets.

# Download #

```
git clone https://github.com/sudomesh/service-browser.git
```

# Install dependencies #

```
cd service-browser/
npm install
```

# Build #

```
./node_modules/gulp/bin/gulp.js
```

# Setup #

Specify the port and hostname where you want the server to listen in config.js.

# Running #

```
./index.js
```

# Gulp/Browserify/Bower #

service-browser uses Gulp, Browserify, and Bower to manage front-end dependencies.
So this means that you can use npm packages inside of client-side javascript
There's pretty decent documentation for these modules all over the internets.

## Gulp ##

Gulp is a javascript build system/task manager. By running `./node_modules/gulp/bin/gulp.js` you are 
running the `./gulp/tasks/default.js` task which runs a build and then watch task.
The build task will optimize images, compile LESS and run browserify.

All of the tasks are under  `./gulp/tasks`. You can run any individual tasks by running:
`./node_modules/gulp/bin/gulp.js build` where build is the name of the task you'd want to run


## Browserify ##

Browserify is a nifty tool which lets you use CommonJS require syntax to pull in npm modules into
client-side JS. Thanks substack!
Most of the magic is inside of `./gulp/tasks/browserify.js`

Say you wanted to use lodash (an underscore analog) in a client-side script. You could do the following
`npm install --save lodash` (use --save if you want to add the module to package.json)
Then inside your client-side JS, you could do the following:

````
var _ = require('lodash')
console.log(_)
```

We also make pretty significant use of browserify-shim, which lets us include packages that aren't 
installable via npm. This is mostly setup inside of `./package.json`. The relevant passage looks 
similar to:

```
  "browser": {
    "jquery-cookie": "./www/bower_components/jquery.cookie/jquery.cookie.js",
    "sockjs-client": "./www/bower_components/sockjs/sockjs.js"
  },
  "browserify": {
    "transform": [
      "browserify-shim",
      "hbsfy"
    ]
  },
  "browserify-shim": {
    "jquery-cookie": {
      "depends": [
        "jquery:$"
      ],
      "exports": "jquery.cookie"
    },
    "sockjs-client": {
      "exports": "SockJS"
    }
  }
```
The values of "browser" are key value pairs where the key is the require() name and the value
is the location of the package

"browserify-shim" delineates the specifics of each of the shimmed packages. There is a field 
for what the package depends on and what it exports. That would be the result of the assignment
```
var variable = require('sockjs-client')
```

The location of the package can be anywhere, although I've been mostly using bower to install
3rd party packages, which brings us to....


## Bower ##
Bower is a fairly generic and unopinionated front-end package manager. I've been using it to install
anything that doesn't exist in npm as well as css packages (like bootstrap)

To install a new package, cd into ./www and then run
```
../node_modules/bin/bower install --save bootstrap
```
where bootstrap is the package you want to install and --save saves it to bower.json

There are a variety of ways you can now use these packages:

- browserify-shim: see above 
- less/css: inside of `./www/css/imports.less` you'll see the lines:
```
  @import "../bower_components/bootstrap/less/bootstrap.less";
```
That will import the bootstrap less file, which will then be compiled by browserify, etc. 


# Troubleshooting #

If you get an error like this:

```
Module version mismatch, refusing to load
```

Then ensure that you don't have any older versions of node, node-gyp or npm sitting around. Deleting older versions of node-gyp from ~/.node-gyp/ may fix this problem.

If you get an error like this:

```
../src/mdns.hpp:31:20: fatal error: dns_sd.h: No such file or directory
 #include <dns_sd.h>
                    ^
compilation terminated.
make: *** [Release/obj.target/dns_sd_bindings/src/dns_sd.o] Error 1
make: Leaving directory `/home/mini/sudo/mesh/service-browser/node_modules/mdns2/build'
gyp ERR! build error 
gyp ERR! stack Error: `make` failed with exit code: 2
gyp ERR! stack     at ChildProcess.onExit (/usr/local/lib/node_modules/npm/node_modules/node-gyp/lib/build.js:267:23)
gyp ERR! stack     at ChildProcess.EventEmitter.emit (events.js:98:17)
gyp ERR! stack     at Process.ChildProcess._handle.onexit (child_process.js:797:12)
gyp ERR! System Linux 3.11.0-19-generic
gyp ERR! command "node" "/usr/local/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"
gyp ERR! cwd /home/mini/sudo/mesh/service-browser/node_modules/mdns2
gyp ERR! node -v v0.10.26
gyp ERR! node-gyp -v v0.12.2
gyp ERR! not ok 

```
it looks like it can be fixed by installing libavahi-compat-libdnssd-dev
```
sudo apt-get install libavahi-compat-libdnssd-dev
```

If you get an error similar to the following:
```
npm http 200 https://registry.npmjs.org/weak/-/weak-0.2.2.tgz
npm http GET https://registry.npmjs.org/bindings
npm http 304 https://registry.npmjs.org/bindings

> weak@0.2.2 install node_modules/weak
> node-gyp rebuild

Traceback (most recent call last):
  File "/usr/lib/node_modules/npm/node_modules/node-gyp/gyp/gyp_main.py", line 18, in <module>
    sys.exit(gyp.script_main())
AttributeError: 'module' object has no attribute 'script_main'
gyp ERR! configure error 
gyp ERR! stack Error: `gyp` failed with exit code: 1
gyp ERR! stack     at ChildProcess.onCpExit (/usr/lib/node_modules/npm/node_modules/node-gyp/lib/configure.js:337:16)
gyp ERR! stack     at ChildProcess.EventEmitter.emit (events.js:98:17)
gyp ERR! stack     at Process.ChildProcess._handle.onexit (child_process.js:789:12)
gyp ERR! System Linux 3.11.0-15-generic
gyp ERR! command "node" "/usr/lib/node_modules/npm/node_modules/node-gyp/bin/node-gyp.js" "rebuild"

gyp ERR! node -v v0.10.15
gyp ERR! node-gyp -v v0.12.1
gyp ERR! not ok 
npm ERR! weak@0.2.2 install: `node-gyp rebuild`
npm ERR! Exit status 1
npm ERR! 
npm ERR! Failed at the weak@0.2.2 install script.
npm ERR! This is most likely a problem with the weak package,
npm ERR! not with npm itself.
npm ERR! Tell the author that this fails on your system:
npm ERR!     node-gyp rebuild
npm ERR! You can get their info via:
npm ERR!     npm owner ls weak
npm ERR! There is likely additional logging output above.

npm ERR! System Linux 3.11.0-15-generic
npm ERR! command "node" "/usr/bin/npm" "install" "weak@0.2.2"
npm ERR! node -v v0.10.15
npm ERR! npm -v 1.3.23
npm ERR! code ELIFECYCLE

npm ERR! not ok code 0
```
this might be helpful. From
http://stackoverflow.com/questions/21155922/error-installing-node-gyp-on-ubuntu

```
#!/bin/bash
#On Ubuntu Saucy:
sudo add-apt-repository ppa:fkrull/deadsnakes
sudo apt-get update
sudo apt-get install python2.6
sudo update-alternatives --install /usr/bin/python python /usr/bin/python2.6 20
sudo update-alternatives --install /usr/bin/python python /usr/bin/python2.7 10

#you can switch between 2.6 & 2.7 using:
sudo update-alternatives --config python
```

It looks like python 2.6 might be a dependency for the mdns module, in which case the stack overflow answer allows for easy switching between 2.6 and 2.7

# ToDo #

* Currently only lists http/https services
* We need to figure out a way to get proper unique ids from services 
* Searching services
* Organizing by category/etc.

# License #

[AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html)
