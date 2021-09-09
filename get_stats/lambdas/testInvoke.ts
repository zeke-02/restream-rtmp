import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
const _ = require('lodash');
import { formatJSONResponse } from './lib/apiGateway';

import { Lambda } from 'aws-sdk';

const lambda = new Lambda({region: 'us-east-1'});

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



export const handler = async (event, _context) => {
    const paramsStats = {
        FunctionName: 'Stats-dev-getStats',
        InvocationType: 'RequestResponse',
        LogType: 'tail',
        Payload: null,
    }; 
    let result = invoke(paramsStats);
    return {
        statusCode: 200,
        body:result
    }
    
    
}