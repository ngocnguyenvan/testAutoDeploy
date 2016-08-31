var http = require('http');
var exec = require('child_process').exec;
http.createServer(function(req, res){
	exec("git pull && git status && git submodule sync && git submodule update && git submodule status && npm install");
}).listen(7812, "192.168.1.8");
console.log('Server running at http://192.168.1.8:7812/');
