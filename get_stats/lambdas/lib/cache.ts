const redis = require('redis');
const { promisify } = require("util");
const client = redis.createClient({ host: 'video-streaming-redis.2qoi21.ng.0001.use1.cache.amazonaws.com'});
client.on("error", function (error) {
    console.error(error);
});

//key pair
const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);

//streams
const xadd = promisify(client.xadd.bind(client));
const xdel = promisify(client.xdel.bind(client));
const xrevrange = promisify(client.xrevrange.bind(client));
const xrange = promisify(client.xrange.bind(client));

//Lists
const rpush = promisify(client.rpush.bind(client));
const lrange = promisify(client.lrange.bind(client));
const lpos = promisify(client.lpos.bind(client));
const lrem = promisify(client.lrem.bind(client));

//Hashes
const hset = promisify(client.hset).bind(client);
const hvals = promisify(client.hvals).bind(client);


const functions = { get, set, del, xadd, xrevrange, rpush, lrange, lpos, lrem, xdel, hset, hvals };
export default functions;