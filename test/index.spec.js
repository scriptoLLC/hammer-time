'use strict';

var test = require('tap').test;
var sio = require('socket.io');

var socketSwarm = require('../');
var generator = require('../examples/default-generator');
var _clients = 0;
var _messages = 0;
var _totalClients = 2;
var _frequency = 50;
var _duration = 500;

function serve(t, cb){
  var io = sio(2345);

  io.sockets.on('connection', function(socket){
    ++_clients;

    socket.on('message', function(data){
      if(data.type === 'iterate'){
        ++_messages;
      }
    });

    socket.on('disconnect', function(){
      socket.leave();
    });
  });


  cb(null, io);
}

test('swarm', function(t){
  serve(t, function(err, io){
    var complete = function(){
      io.close();
      t.equal(_clients, _totalClients, _totalClients+' clients connected');
      t.notEqual(_messages, 0, 'messages were sent');
      t.end();
    };

    socketSwarm('0.0.0.0', 2345, _totalClients, _frequency, _duration, generator, complete);
  });
});

