import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import cache from './lib/cache';
import * as ss from 'simple-statistics';
const _ = require('lodash');
import { formatJSONResponse } from './lib/apiGateway';
import { result } from 'lodash';


export const handler = async (event: {key: string, value: string}, _context) => {

    let response = await cache.set(event.key, event.value);
    return formatJSONResponse(200, response);
}