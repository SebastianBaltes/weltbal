import {Vector3,Matrix4,Quaternion,Math,Euler} from 'three';
import {waitUntil} from '../../commons/Utils';
import CoordinateParser from '../../commons/CoordinateParser';

import {KM} from './constants';
import {getDateFromJD, getJ2000SecondsFromJD, getJD} from './utils/JD';

import Webworker from "worker-loader!./worker/Webworker";

import Body from './Body';
import Snapshot from './Snapshot';

import LLSpherical from "../../commons/LLSpherical";

const spherical = (longitute,latitude) => LLSpherical.create(longitute,latitude,1);

const makeRotationFromBasisSphericals = (...sphericals) => {
    const basis = sphericals.map(s=>s.toVector3());
    const m = new Matrix4().makeBasis( basis[0], basis[1], basis[2] );
    const quaternion = new Quaternion();
    m.decompose(new Vector3(), quaternion, new Vector3());
    return quaternion;
}

const celestialSystem = {

    schema: {
        repositionMs: {type: 'number', default: 1000},
        scaleTime: {type: 'number', default: 1},
        time: {type: 'string', default: new Date().toISOString()},
        latitude: {type: 'number', default: 0},
        longitude: {type: 'number', default: 0},
        altitude: {type: 'number', default: 0},
        north: {type: 'number', default: 0},
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
        this.parseLocation();
        this.startTimeInSim = Date.parse(this.data.time);
        console.log('celestial-system',this.data,this.startTimeInSim);        
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
        // console.log('time in sim: '+new Date(this.time));
        this.postRecalculation(this.time+this.data.repositionMs);
        this.setNextRepositionTime();
    },

    initWebworker() {
        this.worker = new Webworker();
        this.worker.onmessage = event => {
            const json = event.data;
            // console.log('webworker result',json);
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
        this.time = this.startTimeInSim + deltaFromDataTimeMs;
    },

    setNextRepositionTime() {
        this.nextRepositionTime = Date.now() + this.data.repositionMs;
    },
    
    interpolate() {
        if (this.snapshots.length==0) {
            return;
        }
        while (this.snapshots.length>2 && this.snapshots[1].time<this.time) {
            this.snapshots.splice(0,1);
        }
        if (this.currentSnapshot==null) {
            this.currentSnapshot = new Snapshot().copy(this.snapshots[0]);
        }
        if (this.snapshots.length>1) {
            this.currentSnapshot.interpolate(this.snapshots[0],this.snapshots[1],this.time);
        }
        this.setRotationHorizonthalToEquatorial();
    },

    rotationEquatorialToGalactic: makeRotationFromBasisSphericals(
        
        // Vector3 =>   Spherical radius,longitute,latitude
        // (1,0,0)      (1,90,0)
        // (0,1,0)      (1,0,90)
        // (0,0,1)      (1,0,0)
        // J2000
        // GAL                      =>  EQ
        // 90.00000000, 0.00000000      318.00456302, 48.32955335
        // 0.00000000, 90.00000000      192.85949646, 27.12835323
        // 0.00000000, 0.00000000       266.40506655, -28.93616241
    
        spherical(318.00456302, 48.32955335),
        spherical(192.85949646, 27.12835323),
        spherical(266.40506655, -28.93616241),
    ),

    setRotationHorizonthalToEquatorial() {
        const cdata = this.location;                    
        const earth = this.getBody('earth');
        this.rotationHorizonthalToEquatorial = new Quaternion().setFromEuler (
            new THREE.Euler(
                Math.degToRad(cdata.latitude),
                Math.degToRad(cdata.longitude) - earth.rotation - Math.degToRad(103.5),
                Math.degToRad(cdata.north), 'XYZ' ) );
    },

    getObjectPositionInfo(objectName) {
        const spherical = (p,cw) => {
            const s = new LLSpherical().fromVector3(p);
            return {
                radius: s.radius,
                longitude: cw ? s.longitudeCW : s.longitude,
                latitude: s.latitude,
            };
        }
        const body = this.getBody(objectName);        
        if (body) {
            const objectEl = document.querySelector('#'+objectName);
            if (objectEl) {
                const horizonthal = objectEl.object3D.getWorldPosition();
                const equatorial = horizonthal.clone().applyQuaternion(this.rotationHorizonthalToEquatorial); 
                const galactic = equatorial.clone().applyQuaternion(this.rotationEquatorialToGalactic);
                return {
                    azimuthal: spherical(horizonthal,true),
                    equatorial: spherical(equatorial,false),
                    galactic: spherical(galactic,true),
                };
            }            
        } else {
            if (objectName=='m31') {

                const horizonthal = LLSpherical.create(121.1743,-21.5733,10000).toVector3()
                .applyQuaternion(this.rotationHorizonthalToEquatorial.clone().inverse())
                .applyQuaternion(this.rotationEquatorialToGalactic.clone().inverse())
                    ;

                const equatorial = horizonthal.clone().applyQuaternion(this.rotationHorizonthalToEquatorial); 
                const galactic = equatorial.clone().applyQuaternion(this.rotationEquatorialToGalactic);
                return {
                    azimuthal: spherical(horizonthal,true),
                    equatorial: spherical(equatorial,false),
                    galactic: spherical(galactic,true),
                };
            }
        }
    }
            
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


