#!/usr/bin/env node

var fs = require('fs')
var path = require('path')

var minimist = require('minimist')
var log = require('npmlog')

var hammerTime = require('../')

var args
var host
var port = 80
var concurrent = 100
var frequency = 50
var duration = 60000
var generator
var start = (new Date()).getTime()
var verbose = false
var msgCount = 0

function usage () {
  fs.createReadStream(path.join(__dirname, '../usage.txt')).pipe(process.stdout)
}

args = minimist(process.argv.slice(2))
host = args._[0]

if (args.version) {
  var pkg = require(path.join(__dirname, '../package'))
  log.info(pkg.name, 'version', pkg.version)
  process.exit(0)
}

if (!host || args.help || args.h) {
  usage()
  process.exit(0)
}

port = args.port || args.p || port
concurrent = args.concurrent || args.c || concurrent
frequency = args.frequency || args.f || frequency
duration = args.duration || args.d || duration
generator = args.generator || args.g || generator
verbose = args.verbose || args.v || verbose

hammerTime(host, port, concurrent, frequency, duration, generator)
  .on('start', function () {
    if (verbose) {
      log.info('hammer-time', 'Stop! Hammertime!')
    }
  })
  .on('client-connected', function () {
    if (verbose) {
      log.info('hammer-time', 'Client connected')
    }
  })
  .on('error', function (err) {
    log.error('hammer-time', 'An error occurred')
    log.error('hammer-time', err)
  })
  .on('disconnect', function () {
    if (verbose) {
      log.info('hammer-time', 'Client disconnected')
    }
  })
  .on('message', function (msg) {
    ++msgCount
    if (verbose) {
      log.info('hammer-time', msg)
    } else {
      process.stdout.write('.')
    }
  })
  .on('end', function () {
    console.log()
    log.info('hammer-time', 'Sent %j messages in %j seconds', msgCount, ((new Date()).getTime() - start) / 1000)
    process.exit(0)
  })
