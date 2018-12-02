const redis = require('redis')
require('dotenv').config()
const url = require('url');
// const config = {
//     redisConf: {
//     host: process.env.REDISCONNECTION, // The redis's server ip 
//     port: process.env.REDDISPORT,
//     pass: process.env.REDISPASS
//     }
// };  
const redisURL = url.parse(process.env.REDISCLOUD_URL);
const client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);
client.on('connect', () => console.log('Connected to redis'))

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