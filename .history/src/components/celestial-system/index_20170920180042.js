import {Vector3} from 'three';
import {waitUntil} from '../../commons/Utils';
import CoordinateParser from '../../commons/CoordinateParser';

import {KM} from './constants';
import {getDateFromJD, getJ2000SecondsFromJD, getJD} from './utils/JD';

import Webworker from "worker-loader!./worker/Webworker";

import Body from './Body';
import Snapshot from './Snapshot';

const celestialSystem = {

    schema: {
        repositionMs: {type: 'number', default: 5000},
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
        this.currentSnapshot = null;
        this.initWebworker();
    },

    getBody(name) {
        return this.currentSnapshot.getBody(name);
    },

    update() {
        console.log('celestial-system',this.data);        
        this.parseLocation();
        this.startTimeMs = Date.now();
        this.calculateTime();
        this.postRecalculation(this.time);
        this.setNextRepositionTime();
    },

    tick(time, timeDelta) {
        const now = Date.now();
        this.calculateTime();
        this.interpolate();
        if (now<this.nextRepositionTime) {
            return;
        }
        this.postRecalculation(this.time+this.repositionMs);
        this.setNextRepositionTime();
    },

    initWebworker() {
        this.worker = new Webworker();
        this.worker.onmessage = event => {
            const json = event.data;
            console.log('webworker result',json);
            const snapshot = new Snapshot().fromJSON(json);
            this.pushSnapshot(snapshot);
        };
    },

    pushSnapshot(snapshot) {
        this.snapshots.push(snapshot);
        if (!this.ready) {
            this.calculateTime();
            this.interpolate();
            this.ready = true;
            this.el.emit('celestial-system-ready', false);    
        }
    },

    postRecalculation(time) {
        this.worker.postMessage({time});
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

    calculateTime() {
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
        while (this.snapshots.length>1 && this.snapshots[1].time<this.time) {
            this.snapshots.splice(0,1);
        }
        if (this.currentSnapshot==null) {
            this.currentSnapshot = new Snapshot().copy(this.snapshots[0]);
        }
        if (this.snapshots.length>1) {
            this.currentSnapshot.interpolate(this.snapshots[0],this.snapshots[1],this.time);
        }
    },

};

AFRAME.registerComponent('celestial-system', celestialSystem);

// a better dependency mechanism in aframe between components (at least of the scene) would be usefull,
// and systems are crap...
export function injectCelestialSystem(component) {
    const scene = document.querySelector('a-scene');
    const celestial = ()=>scene.components['celestial-system'];
    const inject = ()=>component.celestialSystem = celestial();
    const maybeInject = ()=>{
        const celestialSystem = celestial();
        if (celestialSystem && celestialSystem.ready) {
            inject();
        } else {
            scene.addEventListener('celestial-system-ready', inject);            
        }
    };
    if (scene.hasLoaded) {
        maybeInject();
    } else {
        scene.addEventListener('loaded', maybeInject);
    }
}