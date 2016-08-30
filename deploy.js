var http = require('http');
var sys = require('sys')
var exec = require('child_process').exec;
http.createServer(function(req, res){
	function puts(error, stdout, stderr) { sys.puts(stdout) }
	var options = {};
	exec("git pull && git status && git submodule sync && git submodule update && git submodule status", options, puts);
}).listen(7812, "113.190.240.84");
console.log('Server running at http://113.190.240.84:7812/');
