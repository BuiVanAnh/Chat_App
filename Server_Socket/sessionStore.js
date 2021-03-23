/* abstract */ class SessionStore {
    findSession(id) {}
    saveSession(id, session) {}
    findAllSessions() {}
}

class RedisSessionStore extends SessionStore {
    constructor(redisClient) {
      super();
      this.redisClient = redisClient;
    }
  
    findSession(username) {
      return this.redisClient.get(username, (error, cachedData) => {
        if (error) throw error;
        if (cachedData != null) {
          return cachedData;
        } else {
          next();
        }
      });
    }
  
    saveSession(username, connection) {
        this.redisClient.setex(username, 3600, connection);
    }

    
    async findAllSessions() {
        console.log("findAllSessions");
        var users = [];
        await this.redisClient.keys('*', function (err, keys) {
            if (err) return console.log(err);
          
            for(var i = 0, len = keys.length; i < len; i++) {
              console.log(keys[i]);
              users[i] = keys[i];
            }
        });
        return users;
    }
}

module.exports = {
    RedisSessionStore,
};