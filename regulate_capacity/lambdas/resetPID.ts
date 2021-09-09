import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
const _ = require('lodash');
import { formatJSONResponse } from './lib/apiGateway';
import cache from './lib/cache';

// import { Lambda } from 'aws-sdk';

// const lambda = new Lambda({region: 'us-east-1'});

// const invoke = async (params) => {return new Promise((resolve,reject)=> {
//     lambda.invoke(params, function (err, data) {
//         if (err){
//             reject(err);
//         }
//         else{
//             resolve(data);
//         }
//     });
// }
// )};


export const handler = async (event, _context) => {
    //testInvoke
    try{
      await cache.updatePID({sumError: 0, lastError: 0, lastTime: Date.now()});
      await cache.del("streams");
      let response = await cache.getPID();
      return {
        statusCode: 200,
        body: JSON.stringify(response)
      };
    } catch (err){
      console.log(err);
      throw err;
    }
}