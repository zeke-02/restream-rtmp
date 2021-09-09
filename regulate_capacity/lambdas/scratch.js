// let serverCapacity=10;
// class Controller {

//     constructor(k_p, k_i, k_d, dt, servers) {
//         let i_max;
//         if (typeof k_p === 'object') {
//           let options = k_p;
//           k_p = options.k_p;
//           k_i = options.k_i;
//           k_d = options.k_d;
//           dt = options.dt;
//           servers = options.servers;
//           //i_max = options.i_max;
//         }
    
//         // PID constants
//         this.k_p = (typeof k_p === 'number') ? k_p : 1;
//         this.k_i = k_i || 0;
//         this.k_d = k_d || 0;
    
//         // Interval of time between two updates
//         // If not set, it will be automatically calculated
//         this.dt = dt || 0; //unit is number of streams. to get number of servers = number of streams / 10.

//         //need to keep track of how many queued servers there are so you don't keep requesting more servers.
//         // Maximum absolute value of sumError
//         //this.i_max = i_max || 0;
    
//         this.sumError  = 0;
//         this.lastError = 0;
//         this.lastTime  = 0;
    
//         this.target = 0; // default value, can be modified with .setTarget
//       }
      
//       setTarget (target){ //desired capacity
//           this.target = target;
//       }

//       update (currentCapacity){ //value = current capacity., target = desired capacity (current number of streams)
//         let error = this.target - currentCapacity;
//         console.log('error: ', error);
//         if (error < 0 && Math.abs(error) < serverCapacity){
//             error = 0;
//             console.log('error: ',error);
//         }
//         let dt = this.dt;
//         if (!dt) {
//             let currentTime = Date.now();
//         if (this.lastTime === 0) { // First time update() is called
//             dt = 0;
//         } else {
//             dt = (currentTime - this.lastTime) / 1000; // in seconds
//         }
//         this.lastTime = currentTime;
//         }
//         if (typeof dt !== 'number' || dt === 0) {
//             dt = 1;
//         }
//         this.sumError += error*dt;
//         console.log('Sum Error: ', this.sumError);
//         console.log('Last Error: ', this.lastError)
//         let dError = (error - this.lastError)/dt;
//         console.log('DError: ', dError);

//         this.lastError = error;

//         return (this.k_p * error) + (this.k_i * this.sumError) + (this.k_d * dError);

//      }

//       reset() {
//         this.sumError  = 0;
//         this.lastError = 0;
//         this.lastTime  = 0;
//       }
// }

// let controller = new Controller({
//     k_p:.8,
//     k_d:.2,
//     k_i:0,
//     dt: 5
// })


// controller.setTarget(10);
// let input = 0;
// let result = controller.update(input);
// console.log('target: ', controller.target, 'input: ', input);
// console.log('result: ', result);
// console.log('\n');
// controller.setTarget(20);
// input=10;
// result = controller.update(input);
// console.log('target: ', controller.target, 'input: ', input);
// console.log('result: ', result);
// console.log('\n');

// controller.setTarget(30);
// input=20;
// result = controller.update(input);
// console.log('target: ', controller.target, 'input: ', input);
// console.log('result: ', result);
// console.log('\n');

// controller.setTarget(10);
// input=30;
// result = controller.update(input);
// console.log('target: ', controller.target, 'input: ', input);
// console.log('result: ', result);
// console.log('\n');
const AWS = require('aws-sdk');
const { resolve } = require('path');
const { promisify } = require("util");

const ecs = new AWS.ECS({region: 'us-east-1'});


const lambda = new AWS.Lambda({region: 'us-east-1'});

const invoke = async (params)=> {return new Promise((resolve,reject)=> {
    lambda.invoke(params, function (err, data) {
        if (err){
            reject(err);
        }
        else{
            resolve(data);
        }
    });
}
)}

const updateServers =  async (n) => {
    const params = {
        desiredCount: n,
        service: serviceName
    };
    const updateResult = await ecs.updateService(params).promise();
    return updateResult.service.runningCount + updateResult.service.pendingCount; 
}
const init = async ()=>{
    let response = await invoke({
        FunctionName:'Stats-dev-testGet',
        Payload:JSON.stringify({key: 'key'})
    });
    const value = JSON.parse(response.Payload).body.body;
    console.log(value.Payload);
    // const params = {
    //     cluster: 'arn:aws:ecs:us-east-1:839237287596:cluster/obs-restream-cluster',
    //     service: 'obs-restream-final-relay',
    //     desiredCount: 2
    // }
    // const updateResult = await ecs.updateService(params).promise();
    // console.log(updateResult.service)
    // const listTasksResult = await ecs.listTasks(
    //         { cluster:'arn:aws:ecs:us-east-1:839237287596:cluster/obs-restream-cluster', 
    //         serviceName: 'obs-restream-final-relay', 
    //         desiredStatus: 'RUNNING' }).promise();
    // console.log(listTasksResult.taskArns);

}

//init();
// const getCapacity = (streams, serverCapacity) => {
//     if (streams % serverCapacity != 0){
//         return streams + (serverCapacity - streams % serverCapacity);
//     } else{
//         return streams
//     }
// }
// console.log(getCapacity(6,10));
// const toRange = (val, in_min, in_max, out_min, out_max) => {
//     return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
// }
// console.log(toRange(5,0,20,0,30));
let velocity = 5.10;
const buffer = velocity > 0 ? (20 + velocity * 2 ): 20;
console.log(buffer);