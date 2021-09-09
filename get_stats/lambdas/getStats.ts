import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import cache from './lib/cache';
import * as ss from 'simple-statistics';
import * as _ from "lodash";
import { formatJSONResponse } from './lib/apiGateway';
//import defaultExport from "module-name";
import LOGGER from './lib/logger';


export const handler: APIGatewayProxyHandler = async (event, _context) => {
    const unit_time = 8; //seconds

    let end_ms = _.toString(Date.now());
    let start_ms = _.toString(Number(end_ms) - unit_time * 10**3);

    let n_streams = await cache.get('stream-counter');
    if(!n_streams){
        n_streams = 0;
    }
    
    const in_streams = await cache.xrevrange('incoming-streams', end_ms, start_ms);
    console.log('in streams: ', in_streams);
    const ou_streams = await cache.xrevrange('outgoing-streams', end_ms, start_ms);
    console.log('out streams: ',ou_streams);

    const in_velo = getVelocity(in_streams);
    const ou_velo = getVelocity(ou_streams);
    console.log('incoming velocity: ', in_velo);
    console.log('outgoing velocity: ', ou_velo);

    const velo = in_velo - ou_velo;
    if (velo !== Number.NEGATIVE_INFINITY && velo !== Number.POSITIVE_INFINITY && velo !== Number.NaN){
        await cache.xadd('velocity','*','velocity', _.toString(velo));
    }
    

    const v_streams = await cache.xrevrange('velocity', end_ms, start_ms); // velocity is number of streams per second.

    //LOGGER.log({v_streams});
    if (v_streams.length > 1) { // [recent, older]
        let accel: Array<Array<number>> = []; //extract time (ms) and velocity (streams/s) of each value.
        
        _.forEach(v_streams, (entry,i,array)=>{ //[['time-id', [velocity, val1],...]]
            const t = Number(_.first(_.split(entry[0],'-'))) * 10**(-3);
            const v = Number(entry[1][1]);
            //console.log(v);
            accel.push([t,v]);
        })
        
        _.forEach(accel, (entry)=>{
            entry[0] = entry[0] - accel[accel.length-1][0];
        });
        //console.log(accel); 
        const {m, b} = ss.linearRegression(accel);
        await cache.xadd('acceleration', '*', 'acceleration', _.toString(m));
        LOGGER.log({
            velocity: velo,
            acceleration: m, //streams /s^2
            streams: n_streams
        });

        return formatJSONResponse(200,{
            velocity: velo,
            acceleration: m, //streams /s^2
            streams: n_streams
        })
    } else{
        return formatJSONResponse(200,{
            velocity: velo,
            acceleration: 0,
            streams: n_streams
    
        })
    }    
};

const getVelocity = (streams) => {
    if (streams.length == 0 ){
        return 0;
    }
    let t = [];
    _.forEach(streams, (entry,i,array)=>{
        t.push(entry[0]);
    });
    _.forEach(t, (entry, i, array) => {
        t[i] = Number(_.split(entry, '-')[0]);
    });
    console.log(t);
    let diff_t = ( _.first(t) - _.last(t) ) / 10**3;
    console.log(diff_t);
    return streams.length / diff_t;
}