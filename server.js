const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.static(__dirname));
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/username.html');
});

io.on('connection', (socket) => {
    var room_name = "ChatRoom";
    console.log('a user connected');
    socket.join(room_name);
    socket.on('chat message', (msg) => {
      fs.appendFile('./logs/' + socket.nickname + '.txt', msg + '\n', function (err) {
        if (err) throw err;
        console.log('message written');
      });
      io.to(room_name).emit('chat message', socket.nickname + ": " + msg);
    });
    socket.on('nickname', (nick) => {
      socket.nickname = nick;
    });
    socket.on('quit', (channel) => {
        socket.leave(channel);
    });
    socket.on('setUsername', (username) => {
      socket.nickname = username;
      console.log(username);
  });
    socket.on('create', (msg) => {
      socket.join(msg);
      console.log("created a rooms by the name " + msg);
      io.emit('chat message', "created a room by the name " + msg);
    });
    socket.on('disconnecting', () => {
      console.log(socket.rooms);
    });
    socket.on('join', (msg) => {
      if (io.sockets.adapter.rooms[msg]) {
        socket.join(msg);
        io.emit('chat message', "joined room " + msg);
      } else io.emit('chat message', "channel " + msg + " doesn't exist");
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('list', () => {
      let channels = Array.from(io.sockets.adapter.rooms.keys());
        io.emit('chat message', "The following channels are online: " + channels);
    });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});