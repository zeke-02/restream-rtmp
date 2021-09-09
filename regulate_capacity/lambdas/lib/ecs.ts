import { ECSClient, ListTasksCommand, UpdateServiceCommand } from "@aws-sdk/client-ecs";

//const ecs = new ECS({'region':'us-east-1'});

//spin up server, spin down server
//list number of current servers
const cluster = 'video-streaming';
const serviceName = 'video-streaming-server';
const clusterARN ='arn:aws:ecs:us-east-1:839237287596:cluster/video-streaming';
import * as _ from 'lodash';


const client = new ECSClient({region : 'us-east-1', maxAttempts: 1});





const listServers = async () => {
  //console.log('fetchServers');
  try {
    // Get the ECS Service tasks
    
    const command = new ListTasksCommand({ cluster: clusterARN, serviceName, desiredStatus: 'RUNNING' });
    const listTasksResult = await client.send(command);
    
    //console.log(JSON.stringify(listTasksResult, null, 3));
    return listTasksResult.taskArns.length;
  } catch (err) {
    console.log(err);
    return 0;
  }
};



const updateServers =  async (n) => {
    const params = {
        desiredCount: n,
        service: serviceName,
        cluster: clusterARN
    };
    const command = new UpdateServiceCommand(params);
    const response = await client.send(command);
    return response.service.desiredCount; 
}

//runTask, stopTask, updateService
//need to have task ARNs for StopTask.

const functions = { listServers, updateServers };

export default functions;
