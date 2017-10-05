import '../../../../src.data/elp.js';
import '../../../../src.data/vsop-earth.js';

import * as THREE from 'three';
import {waitUntil} from '../../../commons/Utils';
import CoordinateParser from '../../../commons/CoordinateParser';

import {KM, VERNAL_EQUINOX_J2000} from '../constants';
import WBody from './WBody';
import {J2000Date, getDateFromJD, getJ2000SecondsFromJD, getJD} from '../utils/JD';

import { sun } from '../bodies/sun';
import { moon } from '../bodies/moon';
import { mercury } from '../bodies/mercury';
import { venus } from '../bodies/venus';
import { earth } from '../bodies/earth';
import { mars } from '../bodies/mars';
import { jupiter } from '../bodies/jupiter';
import { saturn } from '../bodies/saturn';
import { uranus } from '../bodies/uranus';
import { neptune } from '../bodies/neptune';
import { pluto } from '../bodies/pluto';

export default class WUniverse {

    constructor() {
        this.setDate(new Date());
        this.createBodies();
        this.setEarthTiltAndEquatorialReferenceFrame();
    }

    update(time) {
        this.setDate(new Date(time));
        this.updateBodies();
        return this.toJSON();
    }

    updateBodies() {
        this.bodies.forEach(body => body.update());              
    }

    setDate(date) {
        this.date = date;
        this.currentJD = getJD(date);
        this.currentDate = getDateFromJD(this.currentJD);
        this.currentJ2000Time = getJ2000SecondsFromJD(this.currentJD);
        this.currentMs = this.date.getTime();
        
        // Time T measured in Julian centuries from the Epoch J2000.0
        this.T = (this.currentJD - 2451545) / 36525;
    }

    createBodies() {
        // the order of the following list is important
        // satelites must come after the bodies they orbit around
        this.bodies = [
            sun,
            mercury,
            venus,
            earth,
            moon,
            mars,
            jupiter,
            saturn,
            uranus,
            neptune,
            pluto,
        ].map(config => {
            const body = Object.create(WBody);
            Object.assign(body, config);
            return body;
        });

        this.bodiesByName = this.bodies.reduce((byName, body) => {
            byName[body.name] = body;
            return byName;
        }, {});
        
        this.bodies.forEach(body => body.init(this));        
    }

    setEarthTiltAndEquatorialReferenceFrame() {
        // Vernal Equinox: time when days are of equal length, so that the
        // line from sun to earth is orthogonal to earths rotation axis.
        // the earth is tilted by 23.43° around this line, 
        // in opposite direction to earths movement around the sun.
        this.setDate(VERNAL_EQUINOX_J2000);
        this.updateBodies();

        const sun = this.getBody('sun');
        const earth = this.getBody('earth');
        const dirSunEarth = earth.position.clone().sub(sun.position).normalize();
        earth.tiltQuaternionJ2000Equinox = new THREE.Quaternion().setFromAxisAngle( dirSunEarth, THREE.Math.degToRad(earth.tilt)); 

        // see https://en.wikipedia.org/wiki/Equatorial_coordinate_system
        // the equatorial coordinate System is approximately defined 
        // by the orientation of earths north pole at the epoch j2000 (=> +90° declination)
        // and the position of the sun at the vernal equinox (=> 0h right ascension)
        const dirNorth = new THREE.Vector3(0,1,0).applyQuaternion(earth.tiltQuaternionJ2000Equinox).normalize();
        const dirEarthSun = sun.position.clone().sub(earth.position).normalize();
        const dirRightAscension6h = dirNorth.clone().cross(dirEarthSun).normalize();
        const basis = new THREE.Matrix4().makeBasis(dirRightAscension6h,dirNorth,dirEarthSun);
        const quaternion = new THREE.Quaternion();
        basis.decompose(new THREE.Vector3(),quaternion,new THREE.Vector3());
        this.earthOrientationVernalEquinoxJ2000 = quaternion;
   }

    getBody(name) {
        return this.bodies.find(b=>b.name==name);        
    }

    toJSON() {
        return {
            time: this.date.getTime(),
            eqquat: this.earthOrientationVernalEquinoxJ2000.toArray(),
            bodies: this.bodies.map(x=>x.toJSON())
        };
    }

}
