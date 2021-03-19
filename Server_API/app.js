// Setup basic express server
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');

server.listen(9000, () => {
  console.log('Server listening at port %d', 9000);
});

const MongoClient = require('mongodb').MongoClient
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db){
    if (err) throw err;

    console.log('Connected to MongoDB');

    var dbo = db.db("mydb");
    
    app.post('/addANewCollection', function(req, res){
        dbo.createCollection(req.body, function(err, res) {
            if (err) throw err;
            console.log("Collection created!");
            db.close();
        });
    });

    app.get('/', function(req, res){
        console.log('Call to get function');
    });
    

});


