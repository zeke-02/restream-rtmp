const { promisify } = require("util");
const redis = require("redis");

const client = redis.createClient({ host: 'video-streaming-redis.2qoi21.ng.0001.use1.cache.amazonaws.com'}); //process.env.CACHE_DOMAIN });

client.on("error", function (error) {
    console.error(error);
})

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);
const xadd = promisify(client.xadd.bind(client));
const xrevrange = promisify(client.xrevrange.bind(client));
const rpush = promisify(client.rpush.bind(client));
const lrange = promisify(client.lrange.bind(client));
const lpos = promisify(client.lpos.bind(client));
const lrem = promisify(client.lrem.bind(client));
const incr = promisify(client.incr.bind(client));
const decr = promisify(client.decr.bind(client));

const isUnique = async (key,value) => {
    let result = await lpos(key, value);
    return result ? false : true;
}

module.exports = { get, set, del, xadd, xrevrange, rpush, lrange, lpos, lrem, isUnique, incr, decr };
