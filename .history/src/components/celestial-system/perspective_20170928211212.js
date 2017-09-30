
import {AU, KM, PARSEC} from './constants';

export default function perspective(distance) {
    return Math.log2(distance);
    // const solarSystemMaxDistance = 30 * AU * KM;
    // const solarSystemMinDistance = 350000000;
    // const new_max = 30;
    // const new_min = 1;
    // return ( distance - solarSystemMinDistance ) / ( solarSystemMaxDistance - solarSystemMinDistance ) * (new_max - new_min) + new_min;
} 