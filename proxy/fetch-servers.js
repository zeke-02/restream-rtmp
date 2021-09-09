const _ = require('lodash');
const fsPromises = require('fs').promises;
const AWS = require('aws-sdk');
const ecs = new AWS.ECS({region: 'us-east-1', secretAccessKey: '6GOyjeuAHgf7cYmlujtMWm8k5y2HxrV3lbRo1YeD', accessKeyId: 'AKIA4GZTQX2WB6R6KLEU'}); //added region only for scratch

const cluster = 'video-streaming';
const serviceName = 'video-streaming-server';
const containerPort = 1935;



const fetchAWSServers = async () => {
  //console.log('fetchServers');
  try {
    // Get the ECS Service tasks
    const listTasksResult = await ecs.listTasks({ cluster, serviceName, desiredStatus: "RUNNING" }).promise();
    //console.log(JSON.stringify(listTasksResult, null, 3));
    const { taskArns: tasks } = listTasksResult;

    // Describe the tasks.
    const describeTasksResult = await ecs.describeTasks({ cluster, tasks }).promise();
    //console.log(JSON.stringify(describeTasksResult, null, 3));
    
    const runningTasks = _.filter(describeTasksResult.tasks, (task) => { //only the servers that are currently running
      return task.lastStatus == "RUNNING";
    });
    const orderedTasks = _.sortBy(runningTasks, (task)=> Date.parse(task.startedAt));
    const servers = _.map(orderedTasks, (task) => { //only the servers that are currently running, not desiri
      const ip = task.containers[0].networkInterfaces[0].privateIpv4Address;
      return `${ip}`; //no container ports
    });
    //console.log(orderedTasks[0].containers[0].networkInterfaces);
    //console.log(JSON.stringify(servers, null, 3));
    // console.log(servers);
    return servers;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getCurrentServers = async () => {
    let data = await fsPromises.readFile('/usr/local/etc/haproxy/server_state', {encoding:'utf-8'});
    //console.log(data);
    let lines = _.split(data, '\n');
    
    lines.shift();
    lines.shift();
    lines = _.remove(lines, (line)=> {return line != ''});
    //console.log(lines);
    let states=[];
    _.forEach(lines, (elem)=>{
        let match = elem.match(/(mediasrv[0-9]+) ([0-9]+.[0-9]+.[0-9]+.[0-9]+) ([0-9]) /);
        states.push({id: match[1], ip: match[2], status: match[3]});
    })
    //console.log(states);  
    return states;
}



const init = async () => {

    let ready_file = process.argv[2];
    let maint_file = process.argv[3];

    let ecs_servers = await fetchAWSServers();
    let curr_states = await getCurrentServers();
    // console.log('curr_states: ', curr_states);
    console.log('ecs_servers: ', ecs_servers);
    //console.log(curr_states);
    let ready = [];
    let maint = [];
    
    //1. ip doesn't exist bc new, 2. ip exists 3. ip existed before but now is gone 
    //when disable server set to 10.0.0.1
    
    let i=0;
    _.forEach(ecs_servers, (ip)=> {
        if ( ! _.find(curr_states, {ip}) ){
            let state = _.find(curr_states, {ip: '10.0.0.1', status: '0'}, fromIndex=i);
            i = _.findIndex(curr_states, {status: '0'},fromIndex=i) + 1;
            ready.push(state.id, ip);
        }
    });
    
    
    let curr_ready = _.filter(curr_states, (state) =>{
        return state.ip != '10.0.0.1';
    });
    //console.log(curr_ready);
    //disable current servers that are not in ecs servers
    _.forEach(curr_ready, (state) => {
        if ( ecs_servers.indexOf(state.ip) == -1){
            maint.push(state.id);
        }
    });

    const ready_data = _.join(ready, '\n');
    const maint_data = _.join(maint, '\n');

    console.log('maint: ',maint);
    console.log('ready: ',ready);

    await fsPromises.writeFile(ready_file, ready_data);
    await fsPromises.writeFile(maint_file, maint_data);  
}

init();