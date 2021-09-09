import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import cache from './lib/cache';
const _ = require('lodash');
import { formatJSONResponse } from './lib/apiGateway';

export const handler = async (event, _context) => {

    let response = await cache.get(event.key);//await cache.xrevrange('streams', '+', '-', 'COUNT', '30');//
    return formatJSONResponse(200, response);
}