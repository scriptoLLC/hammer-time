#!/usr/bin/env node
'use strict';

var fs = require('fs');

var minimist = require('minimist');
var log = require('npmlog');

var hammerTime = require('../');

var args;
var host;
var port = 80;
var concurrent = 100;
var frequency = 50;
var duration = 60000;
var generator;
var start = (new Date()).getTime();

function usage(){
  fs.createReadStream('usage.txt').pipe(process.stdout);
}

args = minimist(process.argv.slice(2));
host = args._[0];

if(args.v || args.version){
  var pkg = require('../package');
  console.log(pkg.name, 'version', pkg.version);
  process.exit(0);
}

if(!host || args.help || args.h){
  return usage();
}

port = args.port || args.p || port;
concurrent = args.concurrent || args.c || concurrent;
frequency = args.frequency || args.f || frequency;
duration = args.duration || args.d || duration;
generator = args.generator || args.g || generator;

hammerTime(host, port, concurrent, frequency, duration, generator)
	.on('start', function(){
		log.info('hammer-time', 'Stop! Hammertime!');
	})
	.on('client-connected', function(){
		log.info('hammer-time', 'Client connected');
	})
	.on('error', function(err){
		log.error('hammer-time', 'An error occurred')
		log.error('hammer-time', err);
	})
	.on('disconnect', function(){
		log.info('hammer-time', 'Client disconnected');
	})
	.on('message', function(){
		process.stdout.write('.');
	})
	.on('end', function(){
		log.info('hammer-time', 'Finished in %j seconds', ((new Date()).getTime() - start) / 1000);
		process.exit(0);
	});