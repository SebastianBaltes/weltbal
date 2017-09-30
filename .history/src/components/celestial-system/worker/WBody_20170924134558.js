
import { Vector3, Euler, Quaternion, Matrix4 } from 'three';
import OrbitalElements from '../algorithm/OrbitalElements';
import { RAD_TO_DEG, CIRCLE, QUARTER_CIRCLE, DAY, J2000, KM } from '../constants';
// import { J2000, AU, SIDEREAL_DAY, NM_TO_KM, CIRCLE, YEAR, DAY, DEG_TO_RAD } from '../../../constants';
import {getDeltaT} from '../utils/JD';

import LLSpherical from '../../../commons/LLSpherical';

export default {

	isCentral: false,
	baseMapRotation: 0,
	siderealDay: 0,

	init(universe) {
		this.universe = universe;
		this.relativeToBody = this.universe.bodiesByName[this.relativeTo];
		
		this.orbitalElements = Object.create(OrbitalElements);
		this.orbitalElements.setName(this.name);
		this.orbitalElements.setRelativeTo(this.relativeToBody);
		this.orbitalElements.setDefaultOrbit(this.orbit, this.osculatingElementsCalculator, this.positionCalculator);
	},

	update() {
		this.setPosition();
		this.setTilt();
		this.setRotation();
	},

	get jd() {
		return this.universe.currentJD;
	},

	setPosition() {
		this.position = this.isCentral 
			? new Vector3() 
			: this.toThreeJsConventionXYZ(this.orbitalElements.calculatePosition(this.jd, 
				this.universe.maxPrecision && this.maxPrecision));

		if (this.relativeToBody) {
			this.position.add(this.relativeToBody.position);
		}

	},

	toThreeJsConventionXYZ(astro) {
		// see https://en.wikipedia.org/wiki/Geographic_coordinate_system#/media/File:ECEF_ENU_Longitude_Latitude_relationships.svg
		// y = z
		// z = -x
		// x = y
		return astro;
		// return new Vector3().set(-astro.y,astro.z,astro.x);
	},

	getRotationCorrection() {
		return 0;
	},

	setTilt() {
		if (this.tiltQuaternion==null) {
			this.tiltQuaternion = new Quaternion();
		}
	},

	setRotation() {
		//const rot = this.siderealDay==0 ? 0 : ((this.jd - J2000) / (this.siderealDay / DAY));
		// const dt = getDeltaT(this.universe.currentDate);
		// console.log(baseRotation, dt);
		// const rotCorr = 0 - (dt / DAY);
		// console.log('rotCorr',rotCorr);
		// const rotationAngle = rot * CIRCLE;
		// this.rotation = this.baseMapRotation + rotationAngle;
		// führt zu roations-flip nach einem Tag
		// this.rotation = r - Math.floor(r/CIRCLE) * CIRCLE; 
		// this.rotation = r; 
		
		// ftp://tai.bipm.org/iers/conv2003/chapter1/tn32_c1.pdf
		const radPerSeconds = 7.292115e-5;
		const secondsPerDay = 60 * 60 * 24;
		const radSinceJ2000 = (this.jd-J2000) * secondsPerDay * radPerSeconds;
		this.rotation = this.baseMapRotation + radSinceJ2000;
	},

    toJSON() {
		return [this.name,this.position.toArray(),this.tiltQuaternion.toArray(),this.rotation];
    },


};
