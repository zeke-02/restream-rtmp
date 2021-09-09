import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import cache from './lib/cache';
import * as _ from "lodash";
import ecs from './lib/ecs';
import invoke from './lib/lambda';
import logger from './lib/logger';
//import stats from './lib/stats';

//get from redis existing sumError, desiredCapacity, lastError, lastTime
//return to redis new sumError, new desiredCapacity, new lastError, new lastTime.


const constants = {k_p: 1, k_d: 10, k_i:0};
interface PIDCache {
    sumError:string,
    lastError:string,
    lastTime:string,
    desiredCapacity? :string
}

function decodeUtf8(bytes) {
    var encoded = "";
    for (var i = 0; i < bytes.length; i++) {
        encoded += '%' + bytes[i].toString(16);
    }
    return decodeURIComponent(encoded);
  }
export const handler = async (event: any , _context) => { 
    try {
        let body = event;
        logger.log('event: ', event);
        if (! body.testing){
            const paramsStats = {
                FunctionName: 'Stats-dev-getStats',
                LogType: 'Tail',
                }; 
        
            const lResponse = await invoke(paramsStats);
            const arr = decodeUtf8(lResponse);
            const payload = JSON.parse(arr);
            body = JSON.parse(payload.body);
            logger.log('lambda response', body);
        }
        
        _.forEach(body, (val, key)=>{
            if (!_.isNumber(val)){
                body[key] = parseFloat(val);
            }
        });

        const serverCapacity = 40;
        
        const PIDCache: PIDCache = await cache.getPID();
        logger.log('PID stats from Redis: ',PIDCache);
        _.forEach(PIDCache, (val, key)=>{
            if (!_.isNumber(val)){
                PIDCache[key] = parseFloat(val);
            }
        })
        const paramsPID = Object.assign(constants, PIDCache);
        logger.log('params to controller', paramsPID);      
        const controller = new Controller(paramsPID);

        // const results: any = await stats.getStats();
        // logger.log('local function results', results);
        //const desiredCapacity = getCapacity(body.streams, serverCapacity); //should you do this?
        let buffer = 50;//body.velocity > 0 ? ( 50 + body.velocity * 2 ): 50;
        if (buffer == Number.POSITIVE_INFINITY || buffer == Number.NEGATIVE_INFINITY){
            buffer = 60;
        }
        
        const reference = body.streams  + buffer;
        controller.setTarget(reference);

        logger.log('reference', reference);

        const c_servers = body.servers ? body.servers : await ecs.listServers();
        logger.log('number of servers: ', c_servers);

        const PIDresult = controller.update(c_servers * serverCapacity); //currentCapacity vs DesiredCapacity
        let desiredCount = c_servers + Math.ceil(PIDresult / serverCapacity);
        logger.log('PIDresult: ', PIDresult);
        
        if (desiredCount < 1){
            desiredCount = 1;
        }

        logger.log('desiredCount: ', desiredCount);
        await cache.updatePID(controller.stats());
        logger.log('controller stats', controller.stats());
        if (! body.testing){
            await ecs.updateServers(desiredCount);
        }
        return {
            statusCode:200, 
            body: JSON.stringify({desiredCount})
        };
    } catch (err){
        console.log(err);
        return {
            statusCode:500,
            body: null,
        }
    }
    
};

// const toRange = (val, in_min, in_max, out_min, out_max) => {
//     return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
// }

// const getCapacity = (streams, serverCapacity) => {
//     if (streams % serverCapacity != 0){
//         return streams + (serverCapacity - streams % serverCapacity);
//     } else{
//         return streams
//     }
// }


class Controller {
    k_p: number;
    k_i: number;
    k_d: number;
    dt: number;
    sumError: number | null;
    lastError: number | null;
    lastTime: number | null;
    target: number;

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
        if (this.lastError) {
            let dt = currentTime - this.lastTime;
            dError = (error - this.lastError) / dt;
        }
        this.lastError = error;
        this.lastTime = currentTime;
        return (this.k_p * error) + (this.k_i * this.sumError) + (this.k_d * dError);
      }
      //console.log('error: ', error);
      
      //console.log('error2: ',error);
    
    //   if (typeof dt !== 'number' || dt === 0) {
    //       dt = 1;
    //   }
    //   this.sumError += error*dt;
    //   let dError = (error - this.lastError)/dt;
    //   let lerror = this.lastError;
    //   this.lastError = error;
    //   if (error < 0 && Math.abs(error) < serverCapacity){
    //     error = 0;
    //     }
      //console.log('DT: ',dt);
      //console.log('error: ', error, 'Change in Error: ', dError, 'last Error: ', lerror);
     
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

