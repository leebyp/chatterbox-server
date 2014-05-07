var express = require('express');
var fs = require('fs');

var app = express();
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
};

function sendResponse(response, status, data, dataType){
  response.set('Content-Type', dataType || 'text/plain');
  response.writeHeader(status, headers);
  response.write(data);
  response.end();
}

app.listen(5000);

app.get('/', function(req, res) {
  fs.readFile('../client/index.html', function(err, data){
    sendResponse(res, 200, data, 'text/html');
  });
});

app.get('/classes/messages', function(req, res) {
  console.log('responding to get')
  fs.readFile('../server/messages.rtf', 'utf8', function(err, data){
    var resPackage = JSON.parse('['+data+']');
    resPackage = JSON.stringify({results: resPackage});
    res.end(resPackage);
  });
});

app.post('/classes/messages',function(req, res) {
  console.log("calling post");
  var newMessage = '';
  req.on('data', function(data){
    newMessage += data;
  });
  req.on('end', function(){
    newMessage = JSON.parse(newMessage);
    newMessage.createdAt = Date();
    fs.appendFile('../server/messages.rtf', ', '+JSON.stringify(newMessage), function(){console.log(JSON.stringify(newMessage));});
  });
  res.writeHead(201, headers);
  res.end();
});

app.options('/classes/messages', function(req, res) {
  sendResponse(res, 200);
});

app.get('/bower_components/jquery/jquery.min.js', function(req, res){
  fs.readFile('../client/bower_components/jquery/jquery.min.js', function (err, data) {
    sendResponse(res, 200, data, "text/javascript")
  });
});

app.get('/bower_components/underscore/underscore.js', function(req, res){
  fs.readFile('../client/bower_components/underscore/underscore.js', function (err, data) {
    sendResponse(res, 200, data, "text/javascript")
  });
});

app.get('/scripts/app.js', function(req, res){
  fs.readFile('../client/scripts/app.js', function (err, data) {
    sendResponse(res, 200, data, "text/javascript")
  });
});

app.get('/scripts/config.js', function(req, res){
  fs.readFile('../client/scripts/config.js', function (err, data) {
    sendResponse(res, 200, data, "text/javascript")
  });
});

app.get('/styles/styles.css', function(req, res){
  fs.readFile('../client/styles/styles.css', function (err, data) {
    sendResponse(res, 200, data, "text/css")
  });
});
