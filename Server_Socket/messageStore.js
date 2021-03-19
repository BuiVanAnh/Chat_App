/* Abstract */ class MessageStore{
    saveMessage(sender, reciever, message) {}
    findMessagesForUser(userID) {}
}
class MongoDBMessageStore extends MessageStore {
    
    constructor(MongoClient, url, db) {
      super();
      this.MongoClient = MongoClient;
      this.url = url;
      this.db = db;
    }
  
    saveMessage(collection_name, sender, reciever, message) {

        var db_name = this.db;

        this.MongoClient.connect(this.url, function(err, db){
            if (err) throw err;
        
            console.log('Connected to MongoDB');
        
            var dbo = db.db(db_name);

            // dbo.createCollection(collection_name, function(err, res) {
            //     if (err) throw err;
            //     console.log("Collection created!");
            // });

            var myobj = { sender: sender, reciever: reciever, message: message, time: Date() };
            dbo.collection(collection_name).insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        
        });
    }
  
    findMessagesForUser(collectionName) {

        var db_name = this.db;

        this.MongoClient.connect(this.url, function(err, db){
            if (err) throw err;
        
            console.log('Connected to MongoDB');
        
            var dbo = db.db(db_name);

            dbo.collection(collectionName).find({}).toArray(function(err, result) {
                if (err) throw err;
                console.log(result);
                db.close();
                return result;
            });
        });
    }
}
  
module.exports = {
    MongoDBMessageStore,
};