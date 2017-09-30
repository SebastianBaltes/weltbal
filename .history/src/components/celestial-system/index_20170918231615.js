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

    parseLocation() {
        this.location = {
            latitude: CoordinateParser.parse(d.latitude),
            longitude: CoordinateParser.parse(d.longitude),
            altitude,
            north: CoordinateParser.parse(d.north),
        };
    },

    update() {
        console.log('celestial-system',this.data);        
        this.parseLocation();
        this.startTimeMs = Date.now();
        this.calculateCurrentDate();

        this.createBodies();
        this.calculateDimensions();
        this.initBodies();
        this.setNextRepositionTime();
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

    calculateDimensions() {
        const centralBodyName = this.getBody().name;

        //find the largest radius in km among all bodies
        let largestRadius = this.bodies.reduce((memo, body) => {
            return memo < body.radius ? body.radius : memo;
        }, 0);

        //find the largest semi major axis in km among all bodies

        let largestSMA = this.bodies.reduce((memo, body) => {
            return (!body.isCentral && body.orbit && body.orbit.base.a > memo) ? body.orbit.base.a : memo;
        }, 0);
        let smallestSMA = this.bodies.reduce((memo, body) => {
            return (!body.isCentral && body.orbit && (!body.relativeTo || body.relativeTo === centralBodyName) && (!memo || body.orbit.base.a < memo)) ? body.orbit.base.a : memo;
        }, 0);

        smallestSMA *= KM;
        largestSMA *= KM;
        largestRadius *= KM;

        this.size = this.largestSMA = largestSMA;
        this.smallestSMA = smallestSMA;
        this.largestRadius = largestRadius;
    },

    setJD(jd) {
        this.currentJD = jd;
        this.currentDate = getDateFromJD(this.currentJD);
        this.currentJ2000Time = getJ2000SecondsFromJD(this.currentJD);
    },

    getCurrentJ2000Time() {
        return this.currentJ2000Time;
    },

    getCurrentJD() {
        return this.currentJD;
    },

    getCurrentDate() {
        return this.currentDate;
    },

};

AFRAME.registerComponent('celestial-system', celestialSystem);

export default celestialSystem;
