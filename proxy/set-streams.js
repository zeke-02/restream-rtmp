const cache = require('./lib/cache.js');
const { invoke } = require('./lib/lambda');
const fsPromises = require('fs').promises;
const _ = require('lodash');

const getTotalStreams = async () => {
    let data = await fsPromises.readFile('/usr/local/etc/haproxy/show_stat', {encoding:'utf-8'});
    let lines = _.split(data, '\n');
    lines = _.remove(lines, (line)=> {return line != ''});
    let line = _.filter(lines, (elem)=>{
      return elem.match(/ft_rtmp,FRONTEND,([0-9]+),OPEN/);
    });
    let streams = line[0].match(/ft_rtmp,FRONTEND,([0-9]+),OPEN/)[1];
    console.log(streams);
    return streams;
    //invoke controller each time cron runs.
  }

const init = async ()=> {
    //set accurate stream counter.
    const streams = await getTotalStreams();
    await cache.set('stream-counter', streams);
    console.log('streams: ', streams);

    //update desiredCount
    const regResponse = await invoke({FunctionName: 'regulateCapacity-dev-regulateCapacity'});
    console.log('regResponse', regResponse);
}

init();
    