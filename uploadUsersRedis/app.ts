const redis = require('redis');

const { promisify } = require("util");
import * as _ from "lodash";

///const client = redis.createClient({ host: 'video-streaming-redis.2qoi21.ng.0001.use1.cache.amazonaws.com' });

//const getAsync = promisify(client.get).bind(client);
// const hset = promisify(client.hset).bind(client);
// const hvals = promisify(client.hvals).bind(client);

import { readFile } from 'fs/promises';
import { write, writeFile } from "fs";

const retrieveUsers = async (start,end) => {
    let a = [];
    for (let i=start; i <= end; i++){
        //const resp = await hvals(`user:${i}`);
        //a.push({email: resp[0], youtube: resp[1], twitch: resp[2]});
    }
    return a;
}

const init = async () => {
    const buf = await readFile("./data.txt");
    let decoder = new TextDecoder();
    const data = decoder.decode(buf);
    let array = _.split(data, '\n');
    
    _.forEach(array, (elem, i, arr) => {
        arr[i] = _.trimEnd(elem, '\r');
    });

    let toRedis = [];
    _.forEach(array, (elem, index) => {
        let arr = _.split(elem, '\t');
        toRedis[index] = [arr[0], arr[1], arr[2], arr[3]]; 
    });
    let writeData = '';
    _.forEach(toRedis, (elem, index) => {
        writeData += '\n[' + ` \'${elem[0]}\', \'${elem[1]}\', \'${elem[2]}\', \'${elem[3]}\' ],`+'\n'
    });
    console.log(writeData);

    // _.forEach(toRedis, async (elem, i) => {
    //     const email = elem[0];
    //     const pw = elem[1];
    //     const youtube = elem[2];
    //     const twitch = elem[3];
    //     await hset(`user:${i}`, "email", email, "password", pw, "youtube", youtube, "twitch", twitch);
    // });
}


init();

// retrieveUsers(0,1).then(arr=> {
//     console.log(arr);
// });

