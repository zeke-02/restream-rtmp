const redis = require('redis');
const { promisify } = require("util");

const _ = require('lodash');

const client = redis.createClient();
client.on("error", function (error) {
    console.error(error);
})

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);
const xadd = promisify(client.xadd.bind(client));
const xrevrange = promisify(client.xrevrange.bind(client));
const xrange = promisify(client.xrange.bind(client));
const rpush = promisify(client.rpush.bind(client));
const lrange = promisify(client.lrange.bind(client));
const lpos = promisify(client.lpos.bind(client));
const lrem = promisify(client.lrem.bind(client));

const init = async () => {
    const in_streams = await xrevrange('incoming-streams', '+', '-', 'COUNT', '6');
    console.log(in_streams);
    console.log(getVelocity(in_streams));
    process.exit();
}

const getVelocity = (streams) => {
    let t = [];
    _.forEach(streams, (entry,i,array)=>{
        t.push(entry[0]);
    });
    _.forEach(t, (entry, i, array) => {
        t[i] = Number(_.split(entry, '-')[0]);
    });
    console.log(t);
    let diff_t = ( _.first(t) - _.last(t) ) / 10**3;
    console.log(diff_t);

    return streams.length / diff_t;
}
// init();
