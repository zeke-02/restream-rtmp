const { spawn } = require('child_process');
//const cache = require('./lib/cache');
const { timeout, orderServer } = require('./lib/utils');
const queryString = require('query-string');



const APP = process.env.USERS ? true : false;
const factor = Number(process.env.FACTOR) || 1;
const proxy = '34.228.239.238';
let processes = [];

const init = async () => {

    //tasks created first  => pos 0
    //const pos = await orderServer(); 
    //console.log('ORDER: ', pos);

    //get users
    //const users = await cache.retrieveUsers( pos * factor , pos * factor + factor - 1 );
    //console.log('Users: ', users);
    //console.log('Number of Users: ', users.length);

    for (let i=0; i<factor; i++){
        let query = '';
        if (APP){
            //query = '?' + queryString.stringify(users[i]);
        }
        query = '?youtube=2ezw-r40m-uwk1-bzvg-4mc3';//
        console.log('QUERY: ', query);
        const ffmpeg = spawn('ffmpeg', [
            '-re',
            '-stream_loop',
            '-1',
            '-i',
            'input.mp4',//'/usr/src/app/input.mp4',
            '-c',
            'copy',
            '-f',
            'flv',
            `rtmp://${proxy}:1935/stream/key${i}${query}` //${pos}-${i}${query}`
        ]);

        ffmpeg.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        
        ffmpeg.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        ffmpeg.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });

        processes.push(ffmpeg);

        await timeout(500);
    }
}

init();


