#!/usr/bin/env node
'use strict';

var fs = require('fs');
var minimist = require('minimist');

var runTests = require('../');

var args;
var host;
var port = 80;
var concurrent = 100;
var frequency = 50;
var duration = 60000;
var generator;

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

runTests(host, port, concurrent, frequency, duration, generator);
