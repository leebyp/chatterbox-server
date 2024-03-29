//create server using express library
var express = require('express');
var fs = require('fs');
var path = require('path');
var http = require('http');

var app = express();

// CORS for cross origin requests
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10, // Seconds.
};

//send particular response with status code and data
function sendResponse(response, status, data, dataType){
  response.set('Content-Type', dataType || 'text/plain');
  response.writeHeader(status, headers);
  response.write(data);
  response.end();
}

//port to tell server to listen to
app.listen(5000);

//on request to homepage url
app.get('/', function(req, res) {
  fs.readFile('../client/index.html', function(err, data){
    sendResponse(res, 200, data, 'text/html');
  });
});

//responds to get request for messages by reading message file
app.get('/classes/messages', function(req, res) {
  console.log('responding to get')
  fs.readFile('../server/messages.rtf', 'utf8', function(err, data){
    var resPackage = JSON.parse('['+data+']');
    resPackage = JSON.stringify({results: resPackage});
    res.end(resPackage);
  });
});

//takes message on post request and adds to mesages file on server
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

//allows access to client source files requested within index.html
app.configure(function () {
  app.use(express.static(path.join(__dirname, '../client')));
});
