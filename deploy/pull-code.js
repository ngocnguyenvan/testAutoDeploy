'use trict'
var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) { sys.puts(stdout) }
var options = {};
exec("git pull && git status && git submodule sync && git submodule update && git submodule status", options, puts);