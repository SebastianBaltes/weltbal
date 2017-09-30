import Worker from "worker-loader!./worker/Webworker";

import {Vector3} from 'three';
import {waitUntil} from '../../commons/Utils';
import CoordinateParser from '../../commons/CoordinateParser';

import {KM} from './constants';
import Body from './Body';
import {getDateFromJD, getJ2000SecondsFromJD, getJD} from './utils/JD';

import Webworker from "worker-loader!./worker/Webworker";

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
        this.ready = false;
        this.snapshots = [];
        this.bodies = {};
        this.worker = new Webworker();
        this.worker.onmessage = event => {
            this.snapshots.push({
                time: event.time,
                bodies: event.bodies.map(j=>new Body().fromJSON(j)),
            });
            this.ready = true;
        };
    },

    update() {
        console.log('celestial-system',this.data);        
        this.parseLocation();
        this.startTimeMs = Date.now();
        this.calculateCurrentDate();
        this.setNextRepositionTime();
        this.postRecalculation();
    },

    tick(time, timeDelta) {
        const now = Date.now();
        this.interpolate();
        if (now<this.nextRepositionTime) {
            return;
        }
        this.calculateTime();
        this.postRecalculation();
        this.setNextRepositionTime();
    },

    postRecalculation() {
        worker.postMessage({time:this.time});
    },

    parseLocation() {
        const d = this.data;
        this.location = {
            latitude: CoordinateParser.parse(d.latitude),
            longitude: CoordinateParser.parse(d.longitude),
            altitude: d.altitude,
            north: CoordinateParser.parse(d.north),
        };
    },

    calculateCurrentDate() {
        const now = Date.now();
        const deltaFromDataTimeMs = (now - this.startTimeMs)  * this.data.scaleTime;
        this.time = Date.parse(this.data.time) + deltaFromDataTimeMs;
    },

    setNextRepositionTime() {
        this.nextRepositionTime = Date.now() + this.data.repositionMs;
    },
    
    interpolate() {
        if (this.snapshots.length==0) {
            return;
        }
        while (this.snapshots.length>1 && this.snapshots[1].time<now) {
            this.snapshots.splice(0,1);
        }
        const forBodies = (each)=>
            Object.keys(snapshot).forEach(key=>{
                if (!(this.bodies[key])) {
                    this.bodies[key] = new Body();
                } 
                each(key);
            });
        if (this.snapshots.length==1) {
            const snapshot = this.snapshots[0].bodies;
            forBodies(key=>this.bodies[key].copy(snapshot[key]));
        } else {
            const a = this.snapshots[0];
            const b = this.snapshots[1];
            const dt = b.time-a.time;
            const t = (this.time-a.time) / dt;
            forBodies(key=>this.bodies[key].interpolate(a.bodies[key],b.bodies[key],t,dt));
        }
    },

};

AFRAME.registerComponent('celestial-system', celestialSystem);

export default celestialSystem;
