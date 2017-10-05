import * as THREE from 'three';
import {waitUntil} from '../../commons/Utils';
import CoordinateParser from '../../commons/CoordinateParser';

import {AU, KM, CIRCLE} from './constants';
import {getDateFromJD, getJ2000SecondsFromJD, getJD} from './utils/JD';

import Webworker from "worker-loader!./worker/Webworker";

import Body from './Body';
import Snapshot from './Snapshot';

import LLSpherical from "../../commons/LLSpherical";

import perspective from "./perspective";

const spherical = (longitute,latitude) => LLSpherical.create(longitute,latitude,1);

const makeRotationFromBasisSphericals = (...sphericals) => {
    const basis = sphericals.map(s=>s.toVector3());
    const m = new THREE.Matrix4().makeBasis( basis[0], basis[1], basis[2] );
    const quaternion = new THREE.Quaternion();
    m.decompose(new THREE.Vector3(), quaternion, new THREE.Vector3());
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
        body: {type: 'string', default: 'earth'},
        north: {type: 'number', default: 0},
        scaleBody: {type: 'number', default: 1},
        perspective: {type: 'string', default: 'linear'},
    },

    init() {
        this.ready = false;
        this.snapshots = [];
        this.currentSnapshot = null;
        this.observer = {
            matrixRelativeToBody: new THREE.Matrix4(),
            matrixWorld: new THREE.Matrix4(),
            positionWorld: new THREE.Vector3(),
            quaternionWorld: new THREE.Quaternion(),
        };
        this.initWebworker();
    },

    getBody(name) {
        return this.currentSnapshot.getBody(name);
    },

    update() {
        this.startTimeInSim = Date.parse(this.data.time);
        console.log('celestial-system',this.data,new Date(this.startTimeInSim));        
        this.startTimeMs = Date.now();
        this.calculateTime();
        this.postRecalculation(this.time);
        this.setNextRepositionTime();
        this.parseLocation();
        this.el.emit('celestial-system-update', false);    
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
            if (this.rotationEclipticToEquatorial==null) {
                this.rotationEclipticToEquatorial = new THREE.Quaternion().fromArray(json.eqquat);                
            }
            // console.log('json',json);
            const snapshot = new Snapshot().fromJSON(json);
            this.pushSnapshot(snapshot);
        };
    },

    pushSnapshot(snapshot) {
        this.snapshots.push(snapshot);
        if (!this.ready) {
            this.calculateTime();
            this.interpolate();
            this.parseLocation();
            this.ready = true;
            this.el.emit('celestial-system-ready', false);    
        }
    },

    postRecalculation(time) {
        this.worker.postMessage({time});
    },

    parseLocation() {
        if (this.currentSnapshot==null) {
            return;
        }    
        const d = this.data;
        let latitude = CoordinateParser.parse(d.latitude);
        latitude = Math.abs(latitude)>89.999999 ? Math.sign(latitude) * 89.999999 : latitude; 
        this.location = {
            latitude,
            longitude: CoordinateParser.parse(d.longitude),
            north: CoordinateParser.parse(d.north),
            altitude: d.altitude,
            body: this.getBody(d.body),
        };
        this.calculateObserverRelative();
        this.calculateObserverAbsolute();
        console.log(this.location);
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
        this.calculateObserverAbsolute();
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

    // earthOrientationVernalEquinoxJ2000
    rotationEclipticToEquatorial: null,

    calculateObserverRelative() {
        if (this.location==null) {
            return;
        }    

        const {longitude,latitude,body,altitude,north} = this.location;

        const standpointSpherical = LLSpherical.create(longitude, latitude, body.radius + altitude);
        const geoCenterToStandpoint = standpointSpherical.toVector3();
        const northSphericalDirection = LLSpherical.create(0, 90, 1).toVector3().normalize();
        
        const horizonthUpDirection = geoCenterToStandpoint.clone().normalize();
        const horizonthEastDirection = northSphericalDirection.clone().cross(horizonthUpDirection).normalize(); 
        const horizonthNorthDirection = horizonthUpDirection.clone().cross(horizonthEastDirection).normalize(); 
        const horizontSouthDirection = horizonthNorthDirection.clone().multiplyScalar(-1); 

        const m1 = new THREE.Matrix4();
        const m2 = this.observer.matrixRelativeToBody.identity();

        m2.multiply(m1.identity().setPosition(geoCenterToStandpoint));
        m2.multiply(m1.makeBasis(horizonthEastDirection,horizonthUpDirection,horizontSouthDirection));
        m2.multiply(m1.makeRotationAxis ( new THREE.Vector3(0,1,0), THREE.Math.degToRad(north+180) ));
    },

    calculateObserverAbsolute() {
        if (this.location==null) {
            return;
        }    

        const {longitude,latitude,body,altitude,north} = this.location;

        const m2 = this.observer.matrixWorld.identity();
        m2.compose( body.position, body.quaternion, new THREE.Vector3(1,1,1) );
        m2.multiply( this.observer.matrixRelativeToBody );

        m2.decompose( this.observer.positionWorld, this.observer.quaternionWorld, new THREE.Vector3() );        
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
        const transform = (frameId,cw,eclipticPosition) => {
            const frame = document.querySelector(frameId).object3D;
            // const local = eclipticPosition.clone().applyQuaternion(worldQuaternion);
            const local = frame.worldToLocal(eclipticPosition);
            return spherical(local,cw);
        };
        const toCoordinates = eclipticPosition => ({
            azimuthal: transform('#horizontal-reference-frame',true,eclipticPosition),
            equatorial: transform('#equatorial-reference-frame',false,eclipticPosition),
            galactic: transform('#galactic-reference-frame',false,eclipticPosition),
        });
        
        // const scene = document.querySelector('a-scene').object3D;
        // scene.updateMatrixWorld(true);
        const body = this.getBody(objectName); 
        if (body) {
            return toCoordinates(body.position);
        } else {
            if (objectName=='m31') {
                const galactic = LLSpherical.create(121.1743,-21.5733,10000).toVector3()
                const frame = document.querySelector('#galactic-reference-frame').object3D;
                const inverseWM = new THREE.Matrix4().getInverse(frame.matrixWorld,true);
                const ecliptic = galactic.clone().applyMatrix4(inverseWM);
                return toCoordinates(ecliptic);
            }
        }
    },

    perspective(position) {
        if (this.data.perspective=='linear') {
            const perspectivePosition = position.clone().sub(this.observer.positionWorld);
            const distance = perspectivePosition.length();
            return {
                distance,
                perspectiveDistance: distance,
                perspectivePosition: position,
                scale: this.data.scaleBody
            };    
        } else {
            const perspectivePosition = position.clone().sub(this.observer.positionWorld);
            const distance = perspectivePosition.length();
            const perspectiveDistance = perspective(distance);
            const scale = perspectiveDistance / distance * this.data.scaleBody;
            perspectivePosition.normalize().multiplyScalar(perspectiveDistance);
            perspectivePosition.add(this.observer.positionWorld);
            return {
                distance,
                perspectiveDistance,
                perspectivePosition,
                scale
            };
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


