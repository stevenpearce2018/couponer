const redis = require('redis')
const client = redis.createClient()
client.on('connect', () => {
  console.log('Connected to redis')
})
client.on('error', (err) => {
    console.log('Failed to connect to redis, :(. Error: ' + err);
});

// Convert object to string if value is an object
// if a time to live is defined then give the data a time to expire
const set = (key, value, ttl) => {
    let valueToInsert;
    if (typeof value == 'string') valueToInsert = value;
    else valueToInsert = JSON.stringify(value);
    
    if (!ttl) client.set(key, valueToInsert)
    else client.set(key, valueToInsert, 'EX', ttl)    
}
const get = (key, callback) => {
    client.get(key, (error, result) => {
        if (error) throw error;
        if (typeof callback == 'function') {
        try {
                return callback(JSON.parse(result))
            } catch(error) {
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