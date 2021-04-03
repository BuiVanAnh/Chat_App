// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);

server.listen(8888, () => {
  console.log('Server listening at port %d', process.env.PORT);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    console.log("This is: " + process.env.PORT);
    res.sendFile(__dirname + '/chat.html');
});


// const mqtt = require('mqtt');
// // connection option
// const options = {
//   clean: true, // retain session
//   connectTimeout: 4000, // Timeout period
//   // Authentication information
//   clientId: 'emqx_test',
//   // username: 'emqx_test',
//   // password: 'emqx_test',
// }

// const connectUrl = 'mqtt://localhost';
// const client = mqtt.connect(connectUrl, options);

// client.on("connect",function(){	
//   console.log("EMQ X connected");
// });

// var topic_s="testtopic";

// // if (client.connected== true){
//   client.subscribe(topic_s,{qos:1});
//   console.log("Subcribe success");
// // }

// //handle incoming messages
// client.on('message',function(topic, message){
//   console.log("message is "+ message);
// 	console.log("topic is "+ topic);
// });

var mqtt    = require('mqtt');
var count =0;
var client  = mqtt.connect("mqtt://localhost",{clientId:"mqttjs02"});
console.log("connected flag  " + client.connected);

//handle incoming messages
client.on('message',function(topic, message, packet){
	console.log("message is "+ message + " in " + topic);
	// console.log("topic is "+ topic);
});


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
  // count+=1;
  // if (count==2) //ens script
  //   clearTimeout(timer_id); //stop timer
  //   client.end();	
}

//////////////

var options={
  retain:true,
  qos:1
};
var topic="testtopic";
var message="test message 2 ";
// var topic_list=["topic2","topic3","topic4"];
// var topic_o={"topic22":0,"topic33":1,"topic44":1};
console.log("subscribing to topics");
client.subscribe(topic,{qos:1}); //single topic
// client.subscribe(topic_list,{qos:1}); //topic list
// client.subscribe(topic_o); //object
var i = 0;
// var timer_id=setInterval(function(){publish(topic,message + (i++),options);},5000);
//notice this is printed even before we connect
console.log("end of script");
