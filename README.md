
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

# Setup #

Specify the port and hostname where you want the server to listen in config.js.

# Running #

```
./index.js
```

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

* Currently only lists http services
* Web app is super basic right now
* When services disappear web app doesn't remove them
* We need to check for duplicate services on the server

# License #

[AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html)
