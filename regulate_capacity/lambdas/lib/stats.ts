import cache from './cache';
import * as _ from "lodash";
import * as ss from 'simple-statistics';
import LOGGER from './logger';

const getStats = async () => {
    const unit_time = 1; //seconds

    let end_ms = _.toString(Date.now());
    let start_ms = _.toString(Number(end_ms) - unit_time * 10**3);

    let n_streams = await cache.get('stream-counter');
    if(!n_streams){
        n_streams = 0;
    }
    
    const in_streams = await cache.xrevrange('incoming-streams', end_ms, start_ms);
    const ou_streams = await cache.xrevrange('outgoing-streams', end_ms, start_ms);
    const velo = (in_streams.length - ou_streams.length)/unit_time;
    
    await cache.xadd('velocity','*','velocity', _.toString(velo));
    const v_streams = await cache.xrevrange('velocity', end_ms, start_ms); // velocity is number of streams per second.
    LOGGER.log({v_streams});
    if (v_streams.length > 1) { // [recent, older]
        let accel: Array<Array<number>> = []; //extract time (ms) and velocity (streams/s) of each value.
        _.forEach(v_streams, (entry,i,array)=>{ //[['stream-id', [key1, val1, key2, val2]]]
            const s = Number(_.first(_.split(entry[0],'-'))) * 10**(-3);
            const v = Number(entry[1][1]);
            //console.log(v);
            accel.push([s,v]);
        })
        
        _.forEach(accel, (entry)=>{
            entry[0] = entry[0] - accel[accel.length-1][0];
        });
        console.log(accel); 
        const {m, b} = ss.linearRegression(accel);
        await cache.xadd('acceleration', '*', 'acceleration', _.toString(m));
        return {
            velo,
            accel: m, //streams /s^2
            streams: n_streams
        }
    } else {
        return {
            velo,
            accel: 0, //streams /s^2
            streams: n_streams
        }
    }
    
}

const functions = { getStats };

export default functions;