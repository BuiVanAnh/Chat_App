const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);


const { MongoDBMessageStore } = require("./messageStore");
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var db = "mydb";
const messageStore = new MongoDBMessageStore(MongoClient, url, db);


//---------------SocketIO------------------//
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "http://localhost:8888",
  }
});

httpServer.listen(3000, () =>
    console.log(`server listening at http://localhost:3000`)
);

var users = [];

io.use((socket, next) => {
    console.log('The first middleware')
    next();
});
  
io.use((socket, next) => {
    console.log('The second middleware')
    next();
});
  
io.use((socket, next) => {
    console.log('The third middleware')
    next();
});

io.on('connection', (socket) => {

    console.log('A user connected');

    socket.on('new user', (username) => {

        if(! (username in users)){
            // users.push(username);
            console.log("username connected: " + username);
            users[username] = 1;
            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', username);
        }else{
            users[username] += 1;
            console.log(username + ": " + users[username]);
        }

        socket.username = username;

        socket.join(username);

        socket.emit('usernames', Object.keys(users));

        console.log(users);
    });

    // forward the private message to the right recipient (and to other tabs of the sender)
    socket.on("private message", (content, to ) => {

        console.log('Message: ' + content + ' to ' + to);
        console.log('Username: ' + socket.username);

        messageStore.saveMessage(socket.username + '_' + to, socket.username, to, content);
        messageStore.saveMessage(to + '_' + socket.username, socket.username, to, content);

        // socket.emit("new message", {msg: content, sender: socket.username, reciever: to});
        socket.emit("new message", {msg: content, sender: socket.username, reciever: to});
        socket.to(socket.username).emit("new message", {msg: content, sender: socket.username, reciever: to, dif: true});
        socket.to(to).emit("new message", {msg: content, sender: socket.username, reciever: to});
        // users[to].emit("new message", {msg: content, sender: socket.username, reciever: to});
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', () => {

        console.log('User disconnected');
        if(users[socket.username] == 1){
            delete users[socket.username];
            console.log("After delete: " + Object.keys(users));
            socket.broadcast.emit('usernames', Object.keys(users));
        }else{
            users[socket.username] -= 1;
        }

    });

});

//-------------------API---------------------//
app.get('/messageForUser', function(req, res){
    
    var body = req.query;
    console.log(body);
    var messages = messageStore.findMessagesForUser(body.collectionName);
    console.log(messages);
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
    res.send(messages);

});