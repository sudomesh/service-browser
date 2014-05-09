/*
  Copyright 2014 Marc Juul Maxb
  License: AGPLv3

  This file is part of service-browser.

  service-browser is free software: you can redistribute it 
  and/or modifyit under the terms of the GNU Affero General 
  Public License as published by the Free Software Foundation,
  either version 3 of the License, or (at your option) any 
  later version.

  service-browser is distributed in the hope that it will be
  useful, but WITHOUT ANY WARRANTY; without even the implied
  warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR 
  PURPOSE.  See the GNU Affero General Public License for 
  more details.

  You should have received a copy of the GNU Affero General 
  Public License along with service-browser. 
  If not, see <http://www.gnu.org/licenses/>.
*/

define(["jquery", "jquery.cookie", "sockjs", "json2", "handlebars"], function($) {
  $(function() {
        
    console.log("web app initialized");
    var serviceTemplateSource = $("#service-template").html();
    var serviceTemplate = Handlebars.compile(serviceTemplateSource);

    function service_up(service) {
      if (service.txtRecord.scope === "peoplesopen.net") {
        service.host = service.host.replace(/\.$/, '');

        var link = false;
        if(service.type.name === 'http') { 
          link = {
            url: 'http://'+service.host+':'+service.port+'/',
            name: service.name
          };
        } else if(service.type.name === 'https') {
          link = {
            url: 'https://'+service.host+':'+service.port+'/',
            name: service.name
          };
        } 
        var context = {
          link: link,
          name: service.name,
          fullname: service.fullname
        }

        var html = serviceTemplate(context);

        $('.services-container').append(html);
      }
    }

    function service_down(service) {
      // TODO implement this
      console.log("service down handling un-implemented");
    }


    var sock = new SockJS('/websocket');

    sock.onopen = function() {
      console.log('open');
    };
    sock.onmessage = function(e) {
      var data = JSON.parse(e.data);;
      if(data.type == 'service') {

        if(data.action == 'up') {
          service_up(data.service);
        } else if(e.data.action == 'down') {
          service_down(data.service);
        }
      }
    };
    sock.onclose = function() {
      console.log('close');
    };  
  });
});
