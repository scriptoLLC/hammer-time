'use strict';

var http = require('http');
var crypto = require('crypto');
var url = require('url');

var cookie = require('cookie');

var authName;
var authPass;
var userBase = 'test';
var passBase = 'test';

/**
 * What the client responds with when the `connect` message is sent. Called by
 * the `connect` haqndler in the `exports.events` handler
 * @method  clientReadyMessage
 * @param   {object} cookies the cookies
 * @param   {string} user the username
 * @param   {string} pass the password
 * @returns {object} the message
 */
function clientReadyMessage(cookies, user, pass) {
  return {
    type: 'connected',
    username: user,
    sessionID: cookies.sessionID,
    password: pass,
  };
}

exports.events = [{
  name: 'connect',
  method: function(event, socket, cookies, user, pass) {
    socket.json.send(clientReadyMessage(cookies, user, pass));
  }
}, {
  name: 'message',
  method: function() {
    var obj = Array.prototype.slice.call(arguments, -1)[0];
    console.log('got message', obj);
  }
}, {
  name: 'disconnect',
  method: function() {
    console.log('recieved a disconnect event from the server');
  }
}];

/**
 * Autnenticate for a client
 * @method  authenticate
 * @async
 * @param   {string} host hostname
 * @param   {integer} port portname
 * @param   {integer} iteration what client number to generate
 * @param   {Function} cb `err` on error, `err`, `cookies`, `username`, `password` on success
 * @returns {object} undefined
 */
exports.authenticate = function(host, port, iteration, cb) {
  authName = userBase + iteration;
  authPass = passBase + iteration;
  var payload = ['username=', authName, '&password=', authPass].join('');

  var opts = {
    method: 'POST',
    path: '/authenticate',
    host: host,
    port: port,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'content-length': payload.length
    }
  };

  var req = http.request(opts, function(res) {
    var body = '';
    res.on('data', function(chunk) {
      body += chunk.toString();
    });

    res.on('error', function(err) {
      return cb(err);
    });

    res.on('end', function() {
      var cookies = cookie.parse(res.headers.cookies);
      if (typeof res.headers.location !== 'string') {
        return cb(new Error('Auth failed:\nStatus: ' + res.statusCode + '\nMessage: ' + body));
      }
      return cb(null, cookies, authName, authPass);
    });
  });

  req.on('error', function(err) {
    return cb(err);
  });

  req.end(payload);
};

/**
 * Returns the URL to send to the `io.connect` method.
 * @method  getSocketURL
 * @param   {string} host host name
 * @param   {integer} port port
 * @param   {object} cookies if you need them
 * @returns {object} undefined
 */
exports.getSocketURL = function(host, port, cookies) {
  return url.format({
    protocol: 'http',
    hostname: host,
    port: port,
    path: '/',
    query: {
      session: cookies.sessionId
    }
  });
};

/**
 * Returns a message to send to the client
 * @method  clientIterateMessage
 * @param   {object} cookies Any cookies you might need
 * @param   {string} user the name of the user who authenciated
 * @param   {string} pass the password of the user who authenciated
 * @returns {object} undefined
 */
exports.clientIterateMessage = function(cookies, user, pass) {
  return {
    type: 'message',
    user: user,
    pass: pass,
    session: cookies.sessionId
  };
};

