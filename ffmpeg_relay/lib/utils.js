const _ = require('lodash');
const axios = require('axios');
const AWS = require('aws-sdk');
const ecs = new AWS.ECS({region: 'us-east-1'});


const cluster = 'ffmpeg-relay';
const serviceName = 'relay';
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

    //order by time of creation
    const orderedTasks = _.sortBy(runningTasks, (task)=> Date.parse(task.startedAt));

    //only the servers that are currently running, not desired running
    const servers = _.map(orderedTasks, (task) => { 
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

const getTaskMetaData = async () => {
  const response = await axios.get(`${process.env.ECS_CONTAINER_METADATA_URI}/task`);
  return response.data;
}

const fetchIp = async (taskARN) => {
  const tasks = [taskARN];
  const data = await ecs.describeTasks({cluster , tasks}).promise();
  return data.tasks[0].containers[0].networkInterfaces[0].privateIpv4Address;
}

const orderServer = async ()=>{
  try {
    const { TaskARN }= await getTaskMetaData();
    const ip = await fetchIp(TaskARN);
    const servers = await fetchAWSServers();
    return _.indexOf(servers, ip);
  } catch (err){
    console.log(err);
    return -1;
  }
}

const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = { timeout, orderServer };
// const init = async () => {
//   const servers = await fetchAWSServers();
//   console.log(servers);
// }

// init();
