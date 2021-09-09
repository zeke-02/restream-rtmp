const redis = require('redis');
const { promisify } = require("util");
const queryString = require('querystring');

const client = redis.createClient({host: 'users-001.2qoi21.0001.use1.cache.amazonaws.com'});
client.on("error", function (error) {
    console.error(error);
})

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);
const xadd = promisify(client.xadd.bind(client));
const xdel = promisify(client.xdel.bind(client));
const xrevrange = promisify(client.xrevrange.bind(client));
const hvals = promisify(client.hvals.bind(client));
const xrange = promisify(client.xrange.bind(client));
const rpush = promisify(client.rpush.bind(client));
const lrange = promisify(client.lrange.bind(client));
const lpos = promisify(client.lpos.bind(client));
const lrem = promisify(client.lrem.bind(client));

const retrieveUsers = async (start:number,end:number) => {
    let a = [];
    for (let i=start; i<= end; i++){
        const resp = await hvals(`user:${i}`);
        a.push({email: resp[0], youtube: resp[2], twitch: resp[3]});
    }
    return a;
}

export { retrieveUsers };

// const init = async () => {
//     console.log(await get('stream-counter'));
// }

// init();