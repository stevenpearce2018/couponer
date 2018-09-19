const redis = require('redis')
const client = redis.createClient()
client.on('connect', () => {
  console.log('connected to redis')
})
const set = (key, value, ttl) => {
    let timeToLive;
    let valueToInsert;
    if (typeof value == 'string') {
        valueToInsert = value;
    } else {
        valueToInsert = JSON.stringify(value);
    }
    if (!ttl) {
        client.set(key, valueToInsert)
    } else {
        timeToLive = ttl;
        client.set(key, valueToInsert, 'EX', ttl)
    }
    
}
const get = (key, callback) => {
    client.get(key, (error, result) => {
        if (error) {
            throw error;
        }
    if (typeof callback == 'function') {
        if (typeof result == 'string') {
            return callback(JSON.parse(result))
        } else {
            return callback(result)
        }
    }
    })
};

const redisHelper = {
    set,
    get
}

module.exports = redisHelper;