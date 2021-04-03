const express = require('express');
const app = express();
const httpServer = require("http").createServer(app);
const Redis = require("ioredis");
const redisClient = new Redis();
const { setupWorker } = require("@socket.io/sticky");
const { MongoDBMessageStore } = require("./messageStore");
const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var db = "mydb";
const messageStore = new MongoDBMessageStore(MongoClient, url, db);
const { RedisSessionStore } = require("./sessionStore");
const sessionStore = new RedisSessionStore(redisClient);

//---------------SocketIO------------------//
// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "http://localhost:8888",
//   }
// });

const io = require("socket.io")(httpServer, {
    cors: {
    //   origin: "http://localhost:" + process.env.PORT_WEB_1,
        origin: '*',
    },
    adapter: require("socket.io-redis")({
      pubClient: redisClient,
      subClient: redisClient.duplicate(),
    }),
  });

httpServer.listen(process.env.PORT, () =>
    console.log(`server listening at http://localhost:` + process.env.PORT)
);

var users = [];

io.use((socket, next) => {
    next();
});
  
io.use((socket, next) => {
    next();
});
  
io.use((socket, next) => {
    next();
});

io.on('connection', async (socket) => {

    console.log('A user connected: ' + socket.handshake.auth.username);

    socket.join(socket.handshake.auth.username);

    username = socket.handshake.auth.username;

    const [usersinmemory] = await Promise.all([
        sessionStore.findAllSessions()
    ]);

    console.log("Search: " + usersinmemory);

    for(var i = 0, len = usersinmemory.length; i < len; i++) {
        console.log("User: " + usersinmemory[i] + " with " + sessionStore.findSession(usersinmemory[i]));
        users[usersinmemory[i]] = sessionStore.findSession(usersinmemory[i]);
    }

    if(! (username in users)){
        // users.push(username);
        users[username] = 1;
        sessionStore.saveSession(username, 1);
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', username);
    }else{
        users[username] += 1;
        sessionStore.saveSession(username, users[username]);
    }

    socket.username = username;

    socket.emit('usernames', Object.keys(users));

    console.log(users);

    // socket.on('new user', (username) => {

    //     if(! (username in users)){
    //         // users.push(username);
    //         // console.log("username connected: " + username);
    //         // users[username] = 1;
    //         // echo globally (all clients) that a person has connected
    //         socket.broadcast.emit('user joined', username);
    //     }
    //     // else{
    //     //     users[username] += 1;
    //     //     console.log(username + ": " + users[username]);
    //     // }

    //     socket.username = username;

    //     socket.emit('usernames', Object.keys(users));

    //     console.log(users);
    // });

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

// setupWorker(io);

//-------------------API---------------------//
app.get('/messageForUser', function(req, res){
    
    var body = req.query;
    // console.log(body);
    var messages = messageStore.findMessagesForUser(body.collectionName);
    // console.log(messages);
    res.header('Access-Control-Allow-Origin', req.headers.origin || "*");
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
    res.send(messages);

});

// const mqtt = require('mqtt');

// // connection option
// const options = {
//     clean: true, // retain session
//     connectTimeout: 4000, // Timeout period
//     // Authentication information
//     clientId: 'emqx_test',
//     // username: 'emqx_test',
//     // password: 'emqx_test',
// }
  
// const connectUrl = 'mqtt://localhost';
// const client = mqtt.connect(connectUrl, options);
  
// client.on("connect",function(){	
//     console.log("EMQ X connected");
// });
  
// // var options={
// //     retain:true,
// //     qos:1
// // };
  
// // if (client.connected == true){
// //     client.publish("testtopic", "test message", { retain:true, qos:1 } );
// //     console.log("Message push to testtopic");
// // }

// var options2 = {
//     retain:true,
//     qos:1
// };

// var message="test message";
// var topic="testtopic";
// //publish every 5 secs
// var i = 0;
// var timer_id = setInterval(function(){ publish( topic, message + i++, options2);}, 5000);

// //publish function
// function publish(topic,msg,options){
//     console.log("publishing",msg);
//     if (client.connected == true){
//         client.publish(topic,msg,options);
//     }
// }

var mqtt    = require('mqtt');
var client  = mqtt.connect("mqtt://localhost",{clientId:"mqttjs01"});
console.log("connected flag  " + client.connected);

//handle incoming messages
// client.on('message',function(topic, message, packet){
// 	console.log("message is "+ message + " in " + topic);
// 	// console.log("topic is "+ topic);
// });


client.on("connect",function(){	
console.log("connected  "+ client.connected);

})
//handle errors
client.on("error",function(error){
    console.log("Can't connect" + error);
    process.exit(1)
});

//publish
function publish(topic,msg,options){
    console.log("publishing",msg);

    if (client.connected == true){
	
        client.publish(topic,msg,options);

    }
}

//////////////

var options={
    retain:true,
    qos:1
};
var topic="testtopic";
var message="test message 1 ";
// var topic_list=["topic2","topic3","topic4"];
// var topic_o={"topic22":0,"topic33":1,"topic44":1};
// console.log("subscribing to topics");
// client.subscribe(topic,{qos:1}); //single topic
// client.subscribe(topic_list,{qos:1}); //topic list
// client.subscribe(topic_o); //object
var i = 0;
var timer_id=setInterval(function(){publish(topic,message + (i++),options);},5000);
//notice this is printed even before we connect
console.log("end of script");