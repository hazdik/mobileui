var app = require('express')();

var server = require('http').createServer(app);

var io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log(" connection to " + socket);

  socket.emit("Connected to Server");
});

server.listen(8000, function () {
  console.log("Server is running")
});