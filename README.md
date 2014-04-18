
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
# ToDo #

* Currently only lists http services
* Web app is super basic right now
* When services disappear web app doesn't remove them
* We need to check for duplicate services on the server

# License #

[AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html)
