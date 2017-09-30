
import { Vector3, Euler, Quaternion, Matrix4 } from 'three';
import OrbitalElements from '../algorithm/OrbitalElements';
import { RAD_TO_DEG, CIRCLE, QUARTER_CIRCLE, DAY, J2000, KM } from '../constants';
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
		return new Vector3().set(astro.y,astro.z,-astro.x);
	},

	getTilt(xCorr) {
		return new Euler(xCorr, 0, 0, 'YZX');
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
		const rot = this.siderealDay==0 ? 0 : ((this.jd - J2000) / (this.siderealDay / DAY));
		// const rotCorr = this.getRotationCorrection();
		const rotationAngle = rot * CIRCLE;
		this.rotation = this.baseMapRotation + rotationAngle;
		// führt zu roations-flip nach einem Tag
		// this.rotation = r - Math.floor(r/CIRCLE) * CIRCLE; 
		// this.rotation = r; 
	},

    toJSON() {
		return [this.name,this.position.toArray(),this.tiltQuaternion.toArray(),this.rotation];
    },


};
