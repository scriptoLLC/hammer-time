'use strict';

var path = require('path');
var io = require('socket.io-client');
var _intervals = [];

/**
 * Create a websocket client and set it off at the server
 * @method  createClient
 * @private
 * @param   {string} host Hostname
 * @param   {integer} port Port number
 * @param   {integer} concurrent Number of clients to spin up
 * @param   {integer} frequency Amount of time, in ms, to wait between emitting messages
 * @param   {integer} duration Amoutn of time, in ms, to run each client for
 * @param   {object} gen The generator object, required and parse
 * @param   {integer} iteration What client number you're on
 * @returns {object} undefined
 */
function createClient(host, port, concurrent, frequency, duration, gen, iteration){
  /**
   * Default passthru auth option if one is not provided by the generator
   * @method  auth
   * @async
   * @private
   * @param   {string} host hostname
   * @param   {integer} port port
   * @param   {integer} iteration client number
   * @param   {function} postAuth the post-auth method
   * @returns {object} undefined
   */
  var auth =  function(host, port, iteration, postAuth){
    postAuth(null, host, port);
  };

  if(typeof gen.authenticate === 'function'){
    auth = gen.authenticate;
  }

  /**
   * Once auth is complete, this actually initiates the client
   * @method  postAuth
   * @async
   * @private
   * @param   {object} err Error from auth, if any
   * @param   {object} cookies Any cookies to pass through to the socket object
   * @param   {string} user The username used to login
   * @param   {string} pass The password used to login
   * @returns {object} undefined
   */
  var postAuth = function(err, cookies, user, pass){
    if(err){
      console.log('Error', err);
      process.exit(1);
    }

    var socketUrl = gen.getSocketURL(host, port, cookies, user, pass) || host+':'+port;
    var socket = io(socketUrl);

    var getMessage = function(cookies, user, pass){
      return {};
    };

    if(typeof gen.clientIteratemessage === 'function'){
      getMessage = gen.clientIteratemessage;
    }

    gen.events.forEach(function(evt){
      socket.on(evt.name, function(){
        var args = [evt.name, socket, cookies, user, pass].concat(Array.prototype.slice.call(arguments));
        evt.method.apply(null, args);
      });
    });

    _intervals.push(setInterval(function(){
      socket.json.send(getMessage(cookies, user, pass));
    }, frequency));

    setTimeout(function(){
      clearInterval(_intervals.pop());
      if(_intervals.length === 0){
        console.log('done');
        process.exit(0);
      }
    }, duration);
  };

  auth(host, port, iteration, postAuth);
}

/**
 * Generate a random number
 * @method  delay
 * @param   {integer} duration The length of the delay
 * @returns {integer} the amount of ms that hte client should wait before starting a new instance
 */
function delay(duration){
  return Math.floor(Math.random() * ((duration/10) - 1 + 1)) + 1;
}

/**
 * Generate a swarm of socket clients
 * @method  exports
 * @param   {string} host hostname to swarm
 * @param   {integer} port port to swarm
 * @param   {integer} concurrent number of clients to stat
 * @param   {integer} frequency amount of time, in ms, to wait between sending sockets
 * @param   {integer} duration amount of time, in ms, to run the each client for
 * @param   {string} generator The path to the file containing the generator exports
 * @returns {object} undefined
 */
module.exports = function(host, port, concurrent, frequency, duration, generator){
  var gen = {};
  var rando = delay(duration);
  if(typeof generator === 'string'){
    gen = require(path.resolve(process.cwd(), generator));
  }

  var create = function(i){
    createClient(host, port, concurrent, frequency, duration, gen, i);
  };

  for(var i = 0; i < concurrent; i++){
    setTimeout(create, rando, i);
    rando = delay(duration);
  }
};
