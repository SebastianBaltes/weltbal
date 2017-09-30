import Worker from "worker-loader!./Webworker";

import {Vector3} from 'three';
import {waitUntil} from '../../commons/Utils';
import CoordinateParser from '../../commons/CoordinateParser';

import {KM} from './constants';
import CelestialBody from './CelestialBody';
import {getDateFromJD, getJ2000SecondsFromJD, getJD} from './utils/JD';

const celestialSystem = {

    schema: {
        repositionMs: {type: 'number', default: 10000},
        scale: {type: 'number', default: 1},
        scaleTime: {type: 'number', default: 1},
        time: {type: 'string', default: new Date().toISOString()},
        latitude: {type: 'string', default: 0},
        longitude: {type: 'string', default: 0},
        altitude: {type: 'number', default: 0},
        north: {type: 'string', default: 0},
    },

    init() {
        this.bodySnapshots = [];
        this.bodies = {};
    },

    update() {
        console.log('celestial-system',this.data);        
        this.parseLocation();
        this.startTimeMs = Date.now();
        this.calculateCurrentDate();
        this.setNextRepositionTime();
    },

    parseLocation() {
        this.location = {
            latitude: CoordinateParser.parse(d.latitude),
            longitude: CoordinateParser.parse(d.longitude),
            altitude,
            north: CoordinateParser.parse(d.north),
        };
    },

    calculateCurrentDate() {
        const now = Date.now();
        const deltaFromDataTimeMs = (now - this.startTimeMs)  * this.data.scaleTime;
        const time = new Date(Date.parse(this.data.time) + deltaFromDataTimeMs);
        console.log('time',time);
        this.setJD(getJD(time));
    },

    tick(time, timeDelta) {
        const now = Date.now();
        if (now<this.nextRepositionTime) {
            return;
        }
        this.calculateCurrentDate();
        this.repositionBodies();
        this.setNextRepositionTime();
    },

    dump() {
        console.log('- celestial-system -');
        console.log('size '+this.size);
        this.bodies.forEach(body=>{
            console.log(body.name+' '+body.getPosition()+' '+body.getAbsoluteVelocity());
        });
    },

    setNextRepositionTime() {
        this.nextRepositionTime = Date.now() + this.data.repositionMs;
    },

    getBody(name) {
        if (name === 'central' || !name) {
            return this.centralBody;
        }
        return this.bodiesByName[name];
    },

};

AFRAME.registerComponent('celestial-system', celestialSystem);

export default celestialSystem;
