"use strict";

var http = require('http');
var querystring = require('querystring');

var SEND_1TO1_V1_API = "/wt/send_by_phone_numbers";
var SEND_1TO1_V2_API = "/wt/v2/send_by_phone_numbers";
var SEND_1TON_V1_API = "/wt/send";

module.exports.send = function ( group, msg ) {

  var params = querystring.stringify({
    group : group,
    msg : msg
  });
  console.log( params );

  var req = http.request({
    host: 'wt.iwilab.com',
    port: 80,
    path: SEND_1TON_V1_API,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': params.length
    }
  }, function( res ){
/*    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('BODY: ' + chunk);
    });*/
  });

  req.on('socket', function (socket) {
    socket.setTimeout(1000);
    socket.on('timeout', function() {
      req.abort();
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.write(params);
  req.end();

};