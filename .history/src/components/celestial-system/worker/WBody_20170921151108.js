
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
			: this.orbitalElements.calculatePosition(this.jd, 
				this.universe.maxPrecision && this.maxPrecision);
				
		if (this.relativeToBody) {
			this.position.add(this.relativeToBody.position);
		}

	},

	getTilt(xCorr) {
		return new Euler(xCorr, 0, 0, 'YZX');
	},

	getRotationCorrection() {
		return 0;
	},

	setTilt() {
		this.tiltQuaternion = new Quaternion().setFromEuler(this.getTilt(QUARTER_CIRCLE));
	},

	setRotation() {
		const rot = this.siderealDay==0 ? 0 : ((this.jd - J2000) / (this.siderealDay / DAY));
		const rotCorr = this.getRotationCorrection();
		const rotationAngle = (rot + rotCorr) * CIRCLE;
		const r = this.baseMapRotation + rotationAngle;
		this.rotation = r - Math.floor(r/CIRCLE) * CIRCLE; 
	},

    toJSON() {
		return [this.name,this.position.toArray(),this.tiltQuaternion.toArray(),this.rotation];
    },


};
