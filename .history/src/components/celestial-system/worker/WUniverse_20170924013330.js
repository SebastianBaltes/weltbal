import '../../../../src.data/elp.js';
import '../../../../src.data/vsop-earth.js';

import * as THREE from 'three';
import {waitUntil} from '../../../commons/Utils';
import CoordinateParser from '../../../commons/CoordinateParser';

import {KM} from '../constants';
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
        this.maxPrecision = true;
        this.setDate(new Date());
        this.createBodies();
        this.setTiltOfEarth();
        this.setJ200RotationOfEarth();
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

    setTiltOfEarth() {
        // Vernal Equinox: time when days are of equal length, so that the
        // line from sun to earth is orthogonal to earths rotation axis.
        // the earth is tilted by 23.43° around this line, 
        // in opposite direction to earths movement around the sun
        
        // different sources, the exakt time may be 07:30 according to nasa
        this.setDate(J2000Date);
        // new Date('2000-03-20T07:35:00.000Z'));
        this.updateBodies();
        const sun = this.getBody('sun');
        const earth = this.getBody('earth');
        const dirSunEarth = earth.position.clone().sub(sun.position).normalize();
        earth.tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(
            dirSunEarth, THREE.Math.degToRad(earth.tilt) 
        ); 
    }

    getBody(name) {
        return this.bodies.find(b=>b.name==name);        
    }

    setJ200RotationOfEarth() {
        this.setDate(J2000Date);
        this.updateBodies();
        const earth = this.getBody('earth');
        const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, earth.rotation, 0, 'XYZ'));
        this.earthOrientationJ2000 = earth.tiltQuaternion.clone().multiply(rotation);
        console.log('earthOrientationJ2000',this.earthOrientationJ2000);

        // TODO precision
        // const nYears = (this.jd - J2000) / YEAR;
		// const precession = (nYears / 25800) * CIRCLE;
    }

    toJSON() {
        return {
            time: this.date.getTime(),
            bodies: this.bodies.map(x=>x.toJSON())
        };
    }

}
