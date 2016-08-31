var http = require('http');
var sys = require('sys')
var exec = require('child_process').exec;
http.createServer(function(req, res){
	/*function puts(error, stdout, stderr) { sys.puts(stdout) }
	var options = {};*/
	exec("git pull && git status && git submodule sync && git submodule update && git submodule status");
	exec("npm install");
}).listen(7812, "192.168.1.8");
console.log('Server running at http://192.168.1.8:7812/');
