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

var $ = jQuery = require('jquery');
var SockJS = require('sockjs-client');
//var JSON = require('json2');
var _ = require('lodash');
var config = require('./config');

var cssify = require('cssify');
cssify.byUrl('build/index.css');

var ServiceBrowser = window.ServiceBrowser || {};
ServiceBrowser.icons = ServiceBrowser.icons || {};

ServiceBrowser.thisUrl = window.location.protocol + "//" + window.location.host;
ServiceBrowser.templateConfig = ServiceBrowser.templateConfig || {};

if (typeof ServiceBrowser.columns === 'undefined') {
  ServiceBrowser.templateConfig.columnNum = 4;
}

ServiceBrowser.templateConfig.columns = [];
ServiceBrowser.templateConfig.columnWidth = 12 / ServiceBrowser.templateConfig.columnNum;
for (var i=1; i<=ServiceBrowser.templateConfig.columnNum; i++) {
  ServiceBrowser.templateConfig.columns.push({});
};

ServiceBrowser.templates = {
  serviceTemplate: require('../templates/service.html'),
  columnsTemplate: require('../templates/columns.html'),
};

$(function() {
      
  $('.services-container').html(ServiceBrowser.templates.columnsTemplate(ServiceBrowser.templateConfig));

  var services = {};

  function service_up(service) {
    var containsService = _.contains(_.keys(services), service.unique);
    if (service.txtRecord.scope === "peoplesopen.net" && !containsService) {
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

      var serviceClass = undefined;

      if (typeof service.txtRecord === 'object' &&
          typeof service.txtRecord.type === 'string' && 
          typeof ServiceBrowser.icons === 'object' &&
          typeof ServiceBrowser.icons[service.txtRecord.type] === 'string') {
        serviceClass = ServiceBrowser.icons[service.txtRecord.type];
      }

        
      var context = {
        link: link,
        name: service.name,
        id: service.unique,
        description: service.txtRecord.description,
        serviceClass: serviceClass,
        columnNum: ServiceBrowser.columns
      }

      var html = ServiceBrowser.templates.serviceTemplate(context);

      var column = _.size(services) % ServiceBrowser.template.columnNum;

      services[service.unique] = service;


      $('.services-container .column.col-' + column).append(html);
    }
  }

  function service_down(service) {
    if (typeof service.uniqueId === 'string' &&
        services[service.uniqueId] === 'object') {
      delete services[service.uniqueId];
    }
    var removeNode = $('.service-box[data-id="' + service.unique + '"]');
    if (removeNode.length > 0 ) {
      removeNode.remove();
    }
  }

  var sock = new SockJS.create(ServiceBrowser.thisUrl + '/websocket');

  sock.onopen = function() {
    console.log('open');
  };

  sock.onmessage = function(e) {
    console.log(e);
    var data = JSON.parse(e.data);;
    console.log(data);
    if(data.type == 'service') {

      if(data.action == 'up') {
        service_up(data.service);
      } else if(data.action == 'down') {
        service_down(data.service);
      }
    }
  };

  sock.onclose = function() {
    console.log('close');
  };  

});
