var url = require('url')

var userBase = 'test'
var passBase = 'test'

/**
 * What the client responds with when the `connect` message is sent. Called by
 * the `connect` haqndler in the `exports.events` handler
 * @method  clientReadyMessage
 * @param   {object} cookies the cookies
 * @param   {string} user the username
 * @param   {string} pass the password
 * @returns {object} the message
 */
function clientReadyMessage (cookies, user, pass) {
  return {
    type: 'connected',
    user: user,
    sessionID: cookies.sessionID,
    pass: pass
  }
}

exports.events = {
  connect: function (event, cookies, user, pass, message, socket, emitter) {
    socket.json.send(clientReadyMessage(cookies, user, pass))
  },
  disconnect: function (event, cookies, user, pass, message, socket, emitter) {

  }
}

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
exports.authenticate = function (host, port, iteration, cb) {
  return cb(null, {
    sessionId: 'session' + iteration
  }, userBase + iteration, passBase + iteration)
}

/**
 * Returns the URL to send to the `io.connect` method.
 * @method  getSocketURL
 * @param   {string} host host name
 * @param   {integer} port port
 * @param   {object} cookies if you need them
 * @returns {object} undefined
 */
exports.getSocketURL = function (host, port, cookies) {
  return url.format({
    protocol: 'http',
    hostname: host,
    port: port,
    path: '/',
    query: {
      session: cookies.sessionId
    }
  })
}

/**
 * Returns a message to send to the client
 * @method  clientIterateMessage
 * @param   {object} cookies Any cookies you might need
 * @param   {string} user the name of the user who authenciated
 * @param   {string} pass the password of the user who authenciated
 * @returns {object} undefined
 */
exports.clientIterateMessage = function (cookies, user, pass) {
  return {
    type: 'iterate',
    user: user,
    pass: pass,
    session: cookies.sessionId
  }
}
