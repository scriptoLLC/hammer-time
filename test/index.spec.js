var test = require('tap').test
var sio = require('socket.io')

var ht = require('../')
var generator = require('../examples/default-generator')
var _clients = 0
var _messages = 0
var _totalClients = 2
var _frequency = 50
var _duration = 500

function serve (cb) {
  var io = sio(2345)

  io.sockets.on('connection', function (socket) {
    ++_clients

    socket.on('message', function (data) {
      if (data.type === 'iterate') {
        ++_messages
      }
    })

    socket.on('disconnect', function () {
      socket.leave()
    })
  })

  cb(null, io)
}

test('multiple clients connect and send messages', function (t) {
  t.plan(23)
  serve(function (err, io) {
    t.error(err, 'errors')

    ht('0.0.0.0', 2345, _totalClients, _frequency, _duration, generator)
      .on('error', function (err) {
        t.error(err)
      })
      .on('start', function () {
        t.ok(true, 'start fired called')
      })
      .on('message', function (msg) {
        t.ok(msg, 'message sent')
      })
      .on('disconnect', function () {
        t.ok(true, 'disconnect was called')
      })
      .on('end', function () {
        io.close()
        t.equal(_clients, _totalClients, _totalClients + ' clients connected')
        t.notEqual(_messages, 0, _messages + ' messages were sent')
      })
  })
})
