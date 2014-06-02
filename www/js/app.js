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
var Modernizr = require('modernizr');

var cssify = require('cssify');
cssify.byUrl('build/index.css');
cssify.byUrl('build/imports.css');

config.thisUrl = window.location.protocol + "//" + window.location.host;
config.templateConfig = config.templateConfig || {};

if (typeof config.columns === 'undefined') {
  config.templateConfig.columnNum = 4;
}

config.templateConfig.columns = [];
config.templateConfig.columnWidth = 12 / config.templateConfig.columnNum;
for (var i=1; i<=config.templateConfig.columnNum; i++) {
  config.templateConfig.columns.push({});
};

config.templates = {
  serviceTemplate: require('../templates/service.html'),
  columnsTemplate: require('../templates/columns.html'),
};

// Adding contains to String class 
// We may want to place this elsewhere or do this differently
String.prototype.contains = function(it) {
  return this.indexOf(it) != -1;
};

// Not strict about lowercase
String.prototype.lContains = function(it) {
  return this.toLowerCase().indexOf(it.toLowerCase()) != -1;
};

$(function() {
  var serviceBrowser = sb = {

    services: [],
    displayServices: [],

    loadServiceOrders: function() {
      if (typeof localStorage.peoplesOpenServices !== "string") {
        return {};
      }
      try {
        var serviceOrders = JSON.parse(localStorage.peoplesOpenServices);
        return serviceOrders;
      } catch (e) {
        return {};
      }
    },

    saveServiceOrders: function(serviceOrders) {
      localStorage.peoplesOpenServices = JSON.stringify(serviceOrders);
      _.each(serviceOrders, function(serviceOrder, id) {
        var service = _.find(sb.services, function(s) {
          return s.unique === id;
        });
        if (typeof service === "object") {
          if (isNaN(parseInt(service.sortOrder, 10))) {
            service.sortOrder = 0;
          }
          service.sortOrder = serviceOrder.order;
        }
      });
    },

    search: function(searchTerm) {
      console.log(searchTerm);
      sb.displayServices = _.filter(sb.services, function(service) {
        if (service.name.lContains(searchTerm) ||
            service.txtRecord.description.lContains(searchTerm) ||
            service.link.url.lContains(searchTerm) ||
            service.serviceClass.lContains(searchTerm)) {

          return service;
        } else {
          return false;
        }
      });

      sb.drawServices(true);
 
    },

    handlers: function() {
      $('.vote-icon-container .order-icon').off('click');
      $('.vote-icon-container .order-icon').on('click', function(e) {
        var id = $(this).data('id');
        var val = parseInt($(this).data('val'), 10);
        var serviceOrders = sb.loadServiceOrders();
        if (typeof serviceOrders[id] !== "object") {
          serviceOrders[id] = {};
        }
        if (typeof serviceOrders[id].order === "undefined") {
          serviceOrders[id].order = 0;
        }
        serviceOrders[id].order += val;
        sb.saveServiceOrders(serviceOrders);
        sb.drawServices();
      });

      $('form.service-search').off('submit');
      $('form.service-search').on('submit', function(e) {
        e.preventDefault();
        sb.search($('form.service-search input.search-term').val());
        return false;
      });    
    },

    drawServices: function(filtered) {
      var filtered = (typeof filtered === "undefined") ? false : filtered;
      var column;

      for (column = 0; column < config.templateConfig.columnNum; column++) {
        $('.services-container .column.col-' + column).html('');
      }
      
      var servicesToDraw;
      if (filtered) {
        servicesToDraw = sb.displayServices;
      } else {
        servicesToDraw = sb.displayServices = sb.services;
      }

      servicesToDraw = _.sortBy(servicesToDraw, function(s) {
        return -s.sortOrder;
      });
      var i = 0;
      _.each(servicesToDraw, function(service) {
  
        var context = {
          link: service.link,
          name: service.name,
          id: service.unique,
          description: service.txtRecord.description,
          serviceClass: service.serviceClass,
          columnNum: config.columns,
          sortOrder: service.sortOrder
        };

        service.html = config.templates.serviceTemplate(context);

        var column = i % config.templateConfig.columnNum;
        $('.services-container .column.col-' + column).append(service.html);
        i++;
      });
      sb.handlers();
    },

    serviceUp: function(service) {
      var containsService = _.find(sb.services, function(serviceIter) {
        return serviceIter.unique === service.unique;
      });
      if (service.txtRecord.scope === "peoplesopen.net" && !containsService) {
        service.host = service.host.replace(/\.$/, '');

        service.link = false;
        if(service.type.name === 'http') { 
          service.link = {
            url: 'http://'+service.host+':'+service.port+'/',
            name: service.name
          };
        } else if(service.type.name === 'https') {
          service.link = {
            url: 'https://'+service.host+':'+service.port+'/',
            name: service.name
          };
        } 

        if (typeof service.txtRecord === 'object' &&
            typeof service.txtRecord.type === 'string' && 
            typeof config.icons === 'object' &&
            typeof config.icons[service.txtRecord.type] === 'string') {
          service.serviceClass = config.icons[service.txtRecord.type];
        }

        // Ok now we figure out where it should be added - we have to look at 
        // whether or not it's been assigned an "order"
        var id = service.unique;
        var serviceOrders = sb.loadServiceOrders();
        if (typeof serviceOrders[id] === "object" &&
            typeof serviceOrders[id] !== "undefined") { // TODO: Add a better check for isNumber
          service.sortOrder = serviceOrders[id].order;
        } else {
          service.sortOrder = 0;
        }
        sb.services.push(service);
        sb.drawServices();

      }
    },

    serviceDown: function(service) {
      if (typeof service.uniqueId === 'string' &&
          sb.services[service.uniqueId] === 'object') {

        sb.services = _.filter(sb.services, function(serviceIter) {
          return serviceIter.uniqueId !== service.uniquId;
        });
      }
      var removeNode = $('.service-box[data-id="' + service.unique + '"]');
      if (removeNode.length > 0 ) {
        removeNode.remove();
      }
    },

    init: function() {
      // INIT CODE:
      if (Modernizr.localstorage) {
        localStorage.peoplesOpenDotNet = {};
      } else {
        console.log("no local storage - probably will not work entirely");
      }
      $('.services-container').html(config.templates.columnsTemplate(config.templateConfig));

      //var sock = new SockJS.create(config.thisUrl + '/websocket');
      var sock = new SockJS('/websocket');

      sock.onopen = function() {
        console.log('open');
      };

      sock.onmessage = function(e) {
        console.log(e);
        var data = JSON.parse(e.data);;
        console.log(data);
        if(data.type === 'service') {
          if(data.action === 'up') {
            sb.serviceUp(data.service);
          } else if(data.action === 'down') {
            sb.serviceDown(data.service);
          }
        }
      };

      sock.onclose = function() {
        console.log('close');
      };  

    }
  };

  serviceBrowser.init();

});
