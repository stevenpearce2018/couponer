const redis = require('redis')
require('dotenv').config()
const url = require('url');
const redisURL = process.env.REDISCLOUD_URL ? url.parse(process.env.REDISCLOUD_URL) : console.log("No redis url found")
const client = redisURL ? redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true}) : redis.createClient().then(console.log("No redis url found. Connecting to local redis server instead."))
process.env.REDISPASS ? client.auth(process.env.REDISPASS) : console.log("No redis password found.")

client.on('connect', () => console.log('Connected to redis'))

// Convert object to string if value is an object
// if a time to live is defined then give the data a time to expire
const set = (key, value, ttl) => {
    const valueToInsert = typeof value == 'string' ? valueToInsert = value : valueToInsert = JSON.stringify(value);
    !ttl ? client.set(key, valueToInsert) : client.set(key, valueToInsert, 'EX', ttl);
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