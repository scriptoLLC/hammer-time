[![build status](https://secure.travis-ci.org/scriptollc/hammer-time.png)](http://travis-ci.org/scriptollc/hammer-time)

# hammer-time

[![Greenkeeper badge](https://badges.greenkeeper.io/scriptoLLC/hammer-time.svg)](https://greenkeeper.io/)

Create a swarm of socket.io clients to stress test your socket-based application.  Provides hooks to allow for HTTP based authentication to be passed into the socket connection requests if necessary, as well as listening to and responding to various socket events.

## Install/Run

```
npm i -g hammer-time
hammer-time example.com --port 9000 --concurrent 50 --frequency 6000 --duration 100000 --generator my-gen.js
```

## Usage

```
Usage: hammer-time [host] -p [port] -c [concurrency] -f [frequency] -d [duration] -g [generator]

Options:
  --version     Print the version number
  -p, --port        What port to use. Default = 80
  -c, --concurrent  How many clients to run concurrently. Default = 100
  -f, --frequency   Frequency of client messages (ms). Default = 50
  -d, --duration    Length of test (ms). Default = 60000 (1 minute)
  -g, --generator   Name of generator file to load, if any. This will specify
                    the details of how to connect and authenticate to your socket server
  -v, --verbose     Be extremely loud about what it is doing


```

## Programmatic Access

hammer-time is also available as module that can be used outside of the scope of the CLI. (This is how the tests are run!). The arguments to the method are
the same (and in the same order!) as the CLI, with the addition of an optional callback to be called when the tests are complete.  The method returns an event emitter
which you can use for monitoring the process.  The [CLI interface](bin/hammer-time.js) is a great example of how this works.

```
var ht = require('hammer-time');
ht(host, port, concurrent, frequency, duration, generator)
	.on('start', function(){
		console.log('hammer time is starting');
	})
	.on('error', function(err){
		console.log(err);
	});
```

### Events
* `start` → The client has started, but not asked any clients to yet connect
* `client-connected` → A client has connected to the server and the handshake is complete. If you have an event named `connect`, in your `exports.events` object, that method will be called immediately after this message is emitted.
* `message` → A client has sent a message to the server, the message is passed as an argument
* `disconnect` → A client has disconnected from the server
* `end` → hammer-time has run for the set duration
* `error` → hammer-time encountered as an error. The error is passed as an argument


## Generator

Generators allow you to set custom authentication methods, listeners for the socket, and what message(s) the client should send to flood the server.

The generator *should* export the following symbols (none of these are required, but it might not do much if you don't provide one).

See [examples/default-generator.js](examples/default-generator.js) for an example of how this works.

* `exports.events` → _object_ of functions where the key is the event name, and the value is the function to run for that event


```
{
  [eventname]: function(event name, cookies, username, password, message data, socket object, emitter returned from API)
}
```

The function's signature is:

```
/**
 * Respond to an event
 * @method event
 * @param  {string} the name of the event you're responding to
 * @param  {object} any cookies returned from your auth method
 * @param  {string} the username that was used for authenticating this socket
 * @param  {string} the password that was used for authenticating this socket
 * @param  {object} the message from the socket.io server
 * @param  {object} the socket client
 * @param  {object} the emitter returned from the function. Allows you to emit data to the CLI or other listeners
 */
```

* `exports.authenticate` → `function(host, port, iteration, cb)`

```
/**
 * Authenticate for a client
 * @method  authenticate
 * @async
 * @param   {string} host hostname
 * @param   {integer} port portname
 * @param   {integer} iteration what client number to generate
 * @param   {Function} cb `err` on error, `err`, `cookies`, `username`, `password` on success
 * @returns {object} undefined
 */
```
**note**: `cookies` should be an object of parsed cookies, and username, password will be the credentials used to authenicate.  If authenication fails, the callback should receive an error

* `exports.getSocketUrl` → `function(host, port, cookies)`

```
/**
 * Returns the URL to send to the `io.connect` method.
 * @method  getSocketURL
 * @param   {string} host host name
 * @param   {integer} port port
 * @param   {object} cookies if you need them
 * @returns {string} The URL that should be passed to the socket.io constructor
 */
```

* `exports.clientIterateMessage` → `function(cookies, user, pass)`

```
/**
 * Returns a message to send to the client
 * @method  clientIterateMessage
 * @param   {object} cookies Any cookies you might need
 * @param   {string} user the name of the user who authenciated
 * @param   {string} pass the password of the user who authenciated
 * @returns {object} The message you'd like to pass to the server, or `false` if there is no message
 */
```



## License
Copyright ©2014 Scripto, LLC. Available under the MIT license
