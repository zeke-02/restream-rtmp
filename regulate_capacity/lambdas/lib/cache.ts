const redis = require('redis');
const { promisify } = require("util");

interface PID {
    sumError:string,
    lastError:string,
    lastTime:string,
    desiredCapacity? :string
}

const client = redis.createClient({ host: 'video-streaming-redis.2qoi21.ng.0001.use1.cache.amazonaws.com'});
client.on("error", function (error) {
    console.error(error);
});

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

const getPID : () => Promise<PID> = async () => {
    try{
        const sumError = await get('sumError');
        const lastError = await get('lastError');
        const lastTime = await get('lastTime');
        return {
            sumError,
            lastError,
            lastTime,
        }
    } catch (err){
        console.log(err);
    }
    
}

const updatePID : (PID: {sumError: number, lastError: number, lastTime: number}) => Promise<void> = async (PID) => {
    try{
        const sumError = await set('sumError', PID.sumError);
        const lastError = await set('lastError', PID.lastError);
        const lastTime = await set('lastTime', PID.lastTime);
        return;
    } catch (err){
        console.log(err);
        return;
    }
}
const init  = async () => {
    console.log(await getPID());
}
const functions = { get, set, del, xadd, xrevrange, rpush, lrange, lpos, lrem, updatePID, getPID };
export default functions;