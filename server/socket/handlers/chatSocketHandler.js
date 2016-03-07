var Chat = require('../../db/models/chat.js');
var Message = require('../../db/models/message.js');
var connected = {};

var errorMessage = {
  messages: [{
    sender: 'ERROR',
    recipient: 'ERROR',
    text: 'Whoops! There was an error in chat. Please try chat at another time.'
  }]
};

module.exports = function(io) {
  io.on('connection', function(socket){
    socket.on('chat:connect', function(data, callback) {
      socket.username = data;
      connected[socket.username] = socket;
      console.log("Sockets in chat: " + Object.keys(connected));
      callback();
    });

    socket.on('chat:send', function(data, callback) {
      var combos = [
        { 'users': [data.sender, data.recipient] },
        { 'users': [data.recipient, data.sender] }
      ];
      Message.create({
        sender: data.sender,
        recipient: data.recipient,
        text: data.text,
      }, function(err, message) {
        if(err) {
          callback(errorMessage);
        } else {
          Chat.findOne({ $or: combos})
          .exec(function(err, chat) {
            if(err) {
              callback(errorMessage);
            } else {
              chat.messages.push(message);
              chat.save(function(err) {
                if(err) {
                  callback(errorMessage);
                } else {
                  callback(message);
                  if(data.recipient in connected) {
                    connected[data.recipient].emit('chat:receive', data);
                  }
                }
              });
            }
          });
        }
      });
    });

    socket.on('chat:refresh', function(data, callback) {
      var combos = [
        { 'users': [data.sender, data.recipient] },
        { 'users': [data.recipient, data.sender] }
      ];
      Chat.findOne({ $or: combos})
      .populate({
        path: 'messages',
        options: {
          sort: {
            'created_at': 1 
          }
        }
      })
      .exec(function(err, chat) {
        if(err) {
          callback(errorMessage);
        } else {
          if(chat) {
            callback(chat);
          } else {
            Chat.create({
              'users': [data.sender, data.recipient]
            }, function(err, chat) {
              if(err) {
                callback(errorMessage);
              } else {
                callback(chat);
              }
            });
          }
        }
      });
    });

    socket.on('disconnect', function(data){
      console.log("Socket left chat: " + socket.username);
      delete connected[socket.username];
      console.log("Sockets in chat: " + Object.keys(connected));
    });
  });
};
