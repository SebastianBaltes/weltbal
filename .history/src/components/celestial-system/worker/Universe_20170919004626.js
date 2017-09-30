// import '../../../src.data/elp.js';
// import '../../../src.data/vsop-earth.js';

import {Vector3} from 'three';
import {waitUntil} from '../../commons/Utils';
import CoordinateParser from '../../commons/CoordinateParser';

import {KM} from './constants';
import CelestialBody from './CelestialBody';
import {getDateFromJD, getJ2000SecondsFromJD, getJD} from './utils/JD';

import { sun } from './bodies/sun';
import { moon } from './bodies/moon';
import { mercury } from './bodies/mercury';
import { venus } from './bodies/venus';
import { earth } from './bodies/earth';
import { mars } from './bodies/mars';
import { jupiter } from './bodies/jupiter';
import { saturn } from './bodies/saturn';
import { uranus } from './bodies/uranus';
import { neptune } from './bodies/neptune';
import { pluto } from './bodies/pluto';

export default class Universe {

    constructor() {
        this.setDate(new Date());
        this.createBodies();
        this.calculateDimensions();
        this.initBodies();
    }

    update(date) {
        this.setDate(date);
        this.repositionBodies();
        return {
            date: date.getTime(),
            bodies: this.bodies.map(x=>x.toJSON())
        };
    }

    createBodies() {
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
            const body = Object.create(CelestialBody);
            Object.assign(body, config);
            return body;
        });

        this.centralBody = this.bodies.reduce((current, candidate) => {
            return current && current.mass > candidate.mass ? current : candidate;
        }, null);

        this.bodiesByName = this.bodies.reduce((byName, body) => {
            byName[body.name] = body;
            return byName;
        }, {});

        this.bodies.sort((a, b) => {
            return ((a.relativeTo || 0) && 1) - ((b.relativeTo || 0) && 1);
        });

        this.centralBody.isCentral = true;
    }

    initBodies() {
        this.bodies.forEach(body => {
            // if (!body.isCentral) {
            //     body.mass = 1;
            // }
            body.init(this);
            body.setPositionFromJD(this.currentJD);
        });
        this.bodies.forEach(body => {
            body.afterInitialized(true);
            body.setQuaternion();
        });
    }

    repositionBodies() {
        this.bodies.forEach(body => {
            body.reset();
            body.setPositionFromJD(this.currentJD);
        });
        this.bodies.forEach(body => {
            body.afterInitialized(true);
            body.setQuaternion();
        });
    }

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
    }

    setJD(date) {
        this.currentJD = getJD(date);
        this.currentDate = getDateFromJD(this.currentJD);
        this.currentJ2000Time = getJ2000SecondsFromJD(this.currentJD);
    }

}
