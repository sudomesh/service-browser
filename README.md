
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

# ToDo #

*Currently only lists http services
*Web app is super basic right now
*When services disappear web app doesn't remove them
*We need to check for duplicate services on the server

# License #

[AGPLv3](http://www.gnu.org/licenses/agpl-3.0.html)