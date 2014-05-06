/* You should implement your request handler function in this file.
 * And hey! This is already getting passed to http.createServer()
 * in basic-server.js. But it won't work as is.
 * You'll have to figure out a way to export this function from
 * this file and include it in basic-server.js so that it actually works.
 * *Hint* Check out the node module documentation at http://nodejs.org/api/modules.html. */

var url = require("url");
var fs = require("fs");
var qs = require("querystring");

var messages = [{
  username: 'ben',
  text: 'hello',
  createdAt: '2014-05-05T23:52:18.187Z',
  roomname: 'sf'
}];


exports.handler = function(request, response) {
  /*  the 'request' argument comes from nodes http module. It includes info about the
  request - such as what URL the browser is requesting. */

  /* Documentation for both request and response can be found at
   * http://nodemanual.org/0.8.14/nodejs_ref_guide/http.html */

  console.log("Serving request type " + request.method + " for url " + request.url);

  /* Without this line, this server wouldn't work. See the note
   * below about CORS. */
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = "text/plain";

  // define the path that is accepted
  var path = url.parse(request.url).pathname;
  if (path === '/classes/messages'){
    if (request.method === 'GET'){
      console.log("GET request received");
      response.writeHead(200, headers);
      //respond with all messages, but stringified
      var responsePackage = {results: messages};
      responsePackage = JSON.stringify(responsePackage);
      response.end(responsePackage);
    }
    else if (request.method === 'POST'){
      // for posts, wait until entire message is received,
      // add to the string as packets come in
      var newMessage = '';
      request.on('data', function (data){
        newMessage += data;
      });
      // once complete, begin actual parsing and pushing to messages
      request.on('end', function(){
        newMessage = JSON.parse(newMessage);
        newMessage.createdAt = Date();
        messages.push(newMessage);
      });
      response.writeHead(201, headers);
      response.end();
    }
    else if (request.method === 'OPTIONS') {
      response.writeHead(200, headers);
      response.end();     //server must send end response back to client when sending an initial OPTIONS request
    }
    else { // if not post or get,
      response.writeHead(404, headers);
      response.end();
    }
  }
  else { // path was illegal - 404 them
    response.writeHead(404, headers);
    response.end();
  }
};

/* These headers will allow Cross-Origin Resource Sharing (CORS).
 * This CRUCIAL code allows this server to talk to websites that
 * are on different domains. (Your chat client is running from a url
 * like file://your/chat/client/index.html, which is considered a
 * different domain.) */
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10 // Seconds.
};
