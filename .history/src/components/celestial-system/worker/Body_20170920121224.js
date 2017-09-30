
import { Vector3, Euler, Quaternion, Matrix4 } from 'three';
import OrbitalElements from '../algorithm/OrbitalElements';
import { RAD_TO_DEG, CIRCLE, QUARTER_CIRCLE, DAY, J2000, KM } from '../constants';
import LLSpherical from '../../../commons/LLSpherical';

export default {

	init(universe) {
		this.reset();
		this.movement = new Vector3();
		this.invMass = 1 / this.mass;
		this.universe = universe;

		this.orbitalElements = Object.create(OrbitalElements);
		this.orbitalElements.setName(this.name);
		this.orbitalElements.setRelativeTo(this.universe.getBody(this.relativeTo));
		this.orbitalElements.setDefaultOrbit(this.orbit, this.osculatingElementsCalculator, this.positionCalculator);
		//console.log(this.name, this.position, this.velocity);

		//we normally use regular precision for computing position, but in certain cases, bodies have a very precise position calculation, but it is slow. We use it only when needed, that is when we are observing a body from another one (e.g. to see eclipses)
		this.maxPrecision = false;
	},

	reset() {
		this.angle = 0;
		this.force = new Vector3();
		this.movement = new Vector3();
		this.previousPosition = null;
	},

	setPositionFromJD(jd) {
		this.currentJD = jd;
		// console.log(jd, this.maxPrecision);
		this.position = this.isCentral ? new Vector3() : this.orbitalElements.calculatePosition(jd, this.maxPrecision);

		this.relativePosition = this.position.clone();

		this.lastPos = this.position.clone();
		this.absvelocity = null;
		this.relvelocity = null;
		return this.position;
	},

	afterInitialized(isSetRelativeTo) {
		// console.log(this.title);
		if (isSetRelativeTo) {
			this.previousRelativePosition = this.position.clone();
			this.positionRelativeTo();
		}
		if (this.customInitialize) this.customInitialize();
		if (this.customAfterTick) this.customAfterTick(0);
	},

	positionRelativeTo() {
		if (this.relativeTo) {

			const central = this.universe.getBody(this.relativeTo);
			if (central && central !== this.universe.getBody()/**/) {
				this.position.add(central.position);
				// console.log(this.name + ' pos rel to ' + this.relativeTo);
				this.addToAbsoluteVelocity(central.getAbsoluteVelocity());
			}
		}
	},

	//gets current rotation of body around its axis
	getCurrentRotation() {
		const rot = ((this.currentJD - J2000) / (this.siderealDay / DAY));
		const rotCorr = (this.getRotationCorrection && this.getRotationCorrection()) || 0;
		// console.log(this.name, rot, rotCorr, (rot + rotCorr) % 1);
		return (rot + rotCorr) * CIRCLE;
		// + ((this.getZeroTime && this.getZeroTime()) || 0)) * CIRCLE;
	},

	//returns euler angle of tilt (default if none set in scenario)
	getTilt(xCorr) {
		return new Euler(xCorr, 0, 0, 'YZX');
	},

	setOnRevolution(cb) {
		this.onRevolution = cb;
	},

	calculatePosition(jd) {
		return this.orbitalElements.calculatePosition(jd);
	},

	getPosition() {
		return this.position.clone();
	},

	getRelativePosition() {
		return this.relativePosition.clone();
	},

	setQuaternion() {
		const qTilt = new Quaternion().setFromEuler(this.getTilt(QUARTER_CIRCLE));
		const qRot = new Quaternion().setFromEuler(new Euler(0, (this.baseMapRotation || 0) + this.getCurrentRotation() ), 0, 'XYZ');
		this.quaternion = new Quaternion().multiplyQuaternions(qTilt, qRot);
	},

	getQuaternion() {
		return this.quaternion.clone();
	},

    toJSON(json) {
		return {
			name: this.name,
			position: this.position.toArray(),
			quaternion: this.quaternion.toArray(),
			tilt: this.tilt,
			rotation: this.currentRotation,
		}
    }


};
