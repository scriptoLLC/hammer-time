'use strict';

var sios = require('socket.io');
var sioc = require('socket.io-client');
var _messages = 0;

function serve(cb){
	var io = sios.listen(2345);

	io.sockets.on('connection', function(socket){
		socket.on('message', function(data){
			console.log(data.type);
			if(data.type === 'hi')
				++_messages;
		});

		socket.on('disconnect', function(){
			socket.leave();
		});
	});

	cb(null, io);
}

serve(function(err, io){
	var socket = sioc('http://127.0.0.01:2345');
	socket.on('connect', function(){
		socket.json.send({type: 'hi'});
		socket.json.send({type: 'hi'});
		socket.json.send({type: 'hi'});
		socket.json.send({type: 'hi'});
		socket.json.send({type: 'hi'});
		socket.json.send({type: 'hi'});
		socket.json.send({type: 'hi'});
	});

	console.log(_messages);
	io.close();
	socket.close();
});

