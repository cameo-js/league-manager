"use strict";

var http = require('http');
var querystring = require('querystring');


module.exports.send = function ( to, msg ) {

  var params = querystring.stringify({
    to : to,
    toType : 'P',
    content : msg
  });
  console.log( params );

  var req = http.request({
    host: 'api.mypeople.daum.net',
    port: 80,
    path: '/closedchannel/send.json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': params.length,
      'X-MYPEOPLE-CHANNELID' :  'mon',
      'X-MYPEOPLE-CHANNELKEY': 'cfd1e273ca9f673fc265ef4b2626ee2e8a2c1fbd'
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