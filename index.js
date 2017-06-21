var events = require('events')
var path = require('path')

var io = require('socket.io-client')

var defaults = require('./defaults')
var _intervals = []
var done
var emitter = new events.EventEmitter()
var clientsAttempted = 0

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
function createClient (host, port, concurrent, frequency, duration, gen, iteration) {
  var auth = defaults.auth
  var getMessage = defaults.getMessage
  emitter.emit('start')

  if (typeof gen.authenticate === 'function') {
    auth = gen.authenticate
  }

  if (typeof gen.clientIterateMessage === 'function') {
    getMessage = gen.clientIterateMessage
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
  var postAuth = function (err, cookies, user, pass) {
    ++clientsAttempted
    if (err) {
      emitter.emit('error', err)
      if (clientsAttempted === concurrent && _intervals.length === 0) {
        emitter.emit('end')
      }
      return
    }

    var socketUrl = gen.getSocketURL(host, port, cookies, user, pass) || host + ':' + port
    var socket = io(socketUrl, { multiplex: false })
      .on('connect', function () {
        emitter.emit('client-connected')
        if (typeof gen.events.connect === 'function') {
          gen.events.connect('connect', cookies, user, pass, {}, socket, emitter)
        }

        Object.keys(gen.events).forEach(function (eventName) {
          socket.on(eventName, function (data) {
            gen.events[eventName].call(null, eventName, cookies, user, pass, data, socket, emitter)
          })
        })

        var sendMessage = function () {
          var message = getMessage(cookies, user, pass)
          if (!Array.isArray(message)) {
            message = [message]
          }

          for (var i = 0, len = message.length; i < len; i++) {
            if (message[i]) {
              socket.json.send(message[i])
              emitter.emit('message', message[i])
            }
          }
        }

        _intervals.push(setInterval(sendMessage, frequency))

        setTimeout(function () {
          clearInterval(_intervals.pop())
          socket.emit('disconnect')
          emitter.emit('disconnect')
          socket.close()
          if (_intervals.length === 0) {
            done()
          }
        }, duration)
      })
      .on('connect_error', function (err) {
        emitter.emit('error', err)
        if (clientsAttempted === concurrent && _intervals.length === 0) {
          emitter.emit('end')
        }
      })
  }

  auth(host, port, iteration, postAuth)
}

/**
 * Generate a swarm of socket clients
 * @method  exports
 * @param   {string}  host hostname to swarm
 * @param   {integer} port port to swarm
 * @param   {integer} concurrent number of clients to stat
 * @param   {integer} frequency amount of time, in ms, to wait between sending sockets
 * @param   {integer} duration amount of time, in ms, to run the each client for
 * @param   {string}  generator The path to the file containing the generator exports
 * @returns {object}  event emitter
 */
module.exports = function (host, port, concurrent, frequency, duration, generator, cb) {
  clientsAttempted = 0
  done = function () {
    emitter.emit('end')
    if (typeof cb === 'function') {
      cb()
    }
  }

  var gen = generator || {}
  if (typeof generator === 'string') {
    try {
      gen = require(path.resolve(process.cwd(), generator))
    } catch (e) {
      console.log('Could not load generator', generator)
      console.log(e)
      process.exit(1)
    }
  }

  for (var i = 0; i < concurrent; i++) {
    createClient(host, port, concurrent, frequency, duration, gen, i)
  }

  return emitter
}
