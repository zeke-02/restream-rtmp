const AWS = require('aws-sdk');
const _ = require('lodash');

const lambda = new AWS.Lambda({region: 'us-east-1'});

const invoke = async (params) => {return new Promise((resolve,reject)=> {
    lambda.invoke(params, function (err, data) {
        if (err){
            reject(err);
        }
        else{
            resolve(data);
        }
    });
}
)};
const { ECS } = require('aws-sdk');
const { validateLocaleAndSetLanguage } = require('typescript');
const ecs = new ECS({'region':'us-east-1'});

//spin up server, spin down server
//list number of current servers
const cluster = 'video-streaming';
const serviceName = 'video-streaming-server';
const clusterARN ='arn:aws:ecs:us-east-1:839237287596:cluster/video-streaming';

const listServers = async () => {
  //console.log('fetchServers');
  try {
    // Get the ECS Service tasks
    const listTasksResult = await ecs.listTasks({ cluster: clusterARN, serviceName, desiredStatus: 'RUNNING' }).promise();
    //console.log(JSON.stringify(listTasksResult, null, 3));
    return listTasksResult.taskArns.length;
  } catch (err) {
    return 0;
  }
};// error = r - current number of stream, d/dt(error) = d/dt(r-current number of streams) = -d/dt(current number of  streams) = -v
const serverCapacity = 3;
class Controller {
  constructor(options) {
      
  
      // PID constants
      this.k_p = options.k_p || 0;
      this.k_i = options.k_i || 0;
      this.k_d = options.k_d || 0;
      this.dt = options.dt || 0; //unit is number of streams. to get number of servers = number of streams / 10
      this.sumError  = options.sumError ? options.sumError : 0;
      this.lastError = options.lastError ? options.lastError : 0;
      this.lastTime  = options.lastTime ? options.lastTime : 0;
  
      this.target = 0; // default value, can be modified with .setTarget
    }
    
    setTarget (target){ //desired capacity
        this.target = target;
    }

    update (currentCapacity){ //value = current capacity., target = desired capacity (current number of streams)
        let error = this.target - currentCapacity;
        let dError = 0;
        let currentTime = Date.now();
        let dt = this.dt || currentTime - this.lastTime;
        if (this.lastError) {

            dError = (error - this.lastError) / dt;
        }
        
        dErrors.push(dError);
        this.lastError = error;
        this.lastTime = currentTime;
        //console.log();
        return (this.k_p * error) + (this.k_i * this.sumError) + (this.k_d * dError);
      }
   stats() {
       return {
           sumError: this.sumError,
           lastError: this.lastError,
           lastTime: this.lastTime
       }
   }

    reset() {
      this.sumError  = 0;
      this.lastError = 0;
      this.lastTime  = 0;
    }
}
const getCapacity = (streams) => {
  if (streams % serverCapacity != 0){
      return streams + (serverCapacity - streams % serverCapacity);
  } else{
      return streams
  }
}
const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const getStreams = (A=600, t=1, T=120) => { //return array of streams that vary sinusoidally 
    let streams = [];
    const b = 2 * Math.PI / T;
    for (let i = 0; i< 24*60/t; i++){
        streams.push(Math.round(A*Math.sin(b * t * i)**2)); //2pi/b = T
    }
    //streams = [0,18,20,24,30,60,95];
    return streams;
}
let dErrors = [];
let references = [];
let desired = [];
let velos = [];
let streams;
const init = async ()=> {
  //logger.log('Getting PID stats...');
  let paramsPID = {k_p:1,k_d:10,k_i:0, dt:60};
  let lastError = 0;
  
  streams = getStreams(); //Amplitude 100, unit t = stream update every 5 minutes, period = 1 hour /60 min
  
  let c_servers = 1;
  for (let i=0; i<streams.length; i++){
      let velocity;
      if (i==0){
          velocity = 0;   
      } else {
          velocity = (streams[i] - streams[i-1])/(60); // velocity = streams per second;
      }
      velos.push(velocity);
      let response = simulate(paramsPID, streams[i], c_servers, velocity, lastError);
      //console.log('dError Term: ', dErrors[dErrors.length - 1]);
      c_servers = response.desiredCount;
      //console.log(response);
      desired.push(c_servers);
      Object.assign(paramsPID, response);
      //console.log(paramsPID);
  }
  for (let i=0; i<streams.length; i++){
      console.log('Input/Number of streams: ', streams[i], 'Desired Count: ', desired[i], 'DError: ', dErrors[i], ' Reference: ', references[i], 'Velocities: ', velos[i]);
  }
}

const simulate = (paramsPID, streams, c_servers, velocity) => {
    //const desiredCapacity = getCapacity(streams);
    const controller = new Controller(paramsPID);
    const buffer = velocity > 0 ? 180 * velocity : 10;
    const reference = streams  + buffer;
    references.push(reference);
    controller.setTarget(reference);
    const PIDresult = controller.update(c_servers * serverCapacity);
    //console.log('PIDresult: ', PIDresult);
    let desiredCount = c_servers + Math.ceil(PIDresult/10);
    if (desiredCount < 1){
        desiredCount = 1;
    }
    //console.log('Current Capacity: ', c_servers * serverCapacity, ' current streams: ', streams, ' PID: ', PIDresult, ' DesiredCount: ', desiredCount);
    
    const stats = controller.stats();
    
    return Object.assign({desiredCount}, stats);
}

init();

// console.log(streams);
// console.log(desired);


// const fs = require('fs');

// const file = fs.createWriteStream('streams1_-60.txt');
// file.on('error', function(err) { console.log(err)});
// streams.forEach(function(v) { file.write(v + '\n'); });
// file.end();

// const file1 = fs.createWriteStream('desired1_-60.txt');
// file1.on('error', function(err) { console.log(err)});
// desired.forEach(function(v) { file1.write(v + '\n'); });
// file1.end();