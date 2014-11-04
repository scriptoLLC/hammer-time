[![build status](https://secure.travis-ci.org/scriptollc/hammer-time.png)](http://travis-ci.org/scriptollc/hammer-time)

# hammer-time

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
  -p, --port        What port to use. Default = 80
  -c, --concurrent  How many clients to run concurrently. Default = 100
  -f, --frequency   Frequency of client messages (ms). Default = 50
  -d, --duration    Length of test (ms). Default = 60000 (1 minute)
  -g, --generator   Name of generator file to load, if any. This will specify
                    the details of how to connect and authenticate to your socket server
```

## Generator

Generators allow you to set custom authentication methods, listeners for the socket, and what message(s) the client should send to flood the server.

The generator *should* export the following symbols (none of these are required, but it might not do much if you don't provide one).

* `exports.events` → _array_ of event objects

```
{
  name: 'event name',
  method: function(event name, socket, cookies, user, pass, message object)
}
```

* `exports.authenticate` → `function(host, port, iteration, cb)`

```
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
 * @returns {object} undefined
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
 * @returns {object} undefined
 */
```

See [examples/default-generator.js](examples/default-generator.js) for an example of how this works.

## License
Copyright ©2014 Scripto, LLC. Available under the MIT license
