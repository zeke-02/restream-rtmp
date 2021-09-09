const _ = require('lodash');
const ejs = require('ejs');
const fs = require('fs');
const AWS = require('aws-sdk');
const ecs = new AWS.ECS({region: 'us-east-1'}); //added region only for scratch

const cluster = 'video-streaming';
const serviceName = 'video-streaming-server';
const containerPort = 1935;


const fetchServers = async () => {
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
      return `${ip}:${containerPort}`;
    });
    //console.log(JSON.stringify(servers, null, 3));

    return servers;
  } catch (err) {
    console.log(err);
    return [];
  }
};

const generateTemplate = async () => {
  //console.log('generateTemplate');
  const servers = await fetchServers();
  //console.log(JSON.stringify(process.argv));
  const templateFile = process.argv[2];
  const outputFile = process.argv[3];
  const template = fs.readFileSync(templateFile, 'utf8');
  //console.log(template);
  const output = ejs.render(template, { servers }, {});
  fs.writeFileSync(outputFile, output);
};




//generateTemplate();
// const init = async () => {
//   const listTasksResult = await ecs.listTasks({ cluster, serviceName }).promise();
//     //console.log(JSON.stringify(listTasksResult, null, 3));
//     const { taskArns: tasks } = listTasksResult;

//     // Describe the tasks.
//     const describeTasksResult = await ecs.describeTasks({ cluster, tasks }).promise();
//     let arr = [];
//     _.forEach(describeTasksResult.tasks, (task)=> {
//       arr.push({ip: task.containers[0].networkInterfaces[0].privateIpv4Address, time: Date.parse(task.startedAt)});
//     })
//     arr = _.sortBy(arr, 'time');
//     console.log(arr)
    
//   console.log(await fetchServers());
// }
// init();