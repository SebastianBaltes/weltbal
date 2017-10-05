import * as THREE from 'three';


export function waitUntil(callback,predicate,waitIntervall=100,maxWaitTime=Date.now()+5000) {
    if (predicate()) {
        callback();
    } else {
        if (Date.now()>maxWaitTime) {
            console.error('maxWaitTime reached!');
        } else {
            setTimeout(()=>waitUntil(callback,predicate,waitIntervall,maxWaitTime),waitIntervall);
        }
    }
}


export function toThreeJsConventionXYZ(astro) {
    // see https://en.wikipedia.org/wiki/Geographic_coordinate_system#/media/File:ECEF_ENU_Longitude_Latitude_relationships.svg
    // y <=> z
    // x = -x
    return new THREE.Vector3().set(-astro.x,astro.z,astro.y);
}

