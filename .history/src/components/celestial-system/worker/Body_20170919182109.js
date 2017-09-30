
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

	getAngleTo(bodyName) {
		const ref = this.universe.getBody(bodyName);
		if (ref) {

			const eclPos = this.position.clone().sub(ref.getPosition()).normalize();
			eclPos.z = 0;
			const angleX = eclPos.angleTo(new Vector3(1, 0, 0));
			const angleY = eclPos.angleTo(new Vector3(0, 1, 0));
			//console.log(angleX, angleY);
			let angle = angleX;
			const q = Math.PI / 2;
			if (angleY > q) angle = -angleX;
			return angle;
		}
		return 0;
	},

	afterInitialized(isSetRelativeTo) {
		// console.log(this.title);
		if (isSetRelativeTo) {
			this.previousRelativePosition = this.position.clone();
			this.positionRelativeTo();
		}
		if (this.customInitialize) this.customInitialize();
		// if (this.customAfterTick) this.customAfterTick(0);
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

	beforeMove() { },
	afterMove() { },

	/**
	Calculates orbit line from orbital elements.
	isFuture indicate if we want the elements for future orbit or for passed orbit (it changes for perturbed orbits)
	*/
	getOrbitVertices(isFuture) {

		const startTime = this.currentJD;
		const elements = this.orbitalElements.calculateElements(startTime);
		const period = this.orbitalElements.calculatePeriod(elements);

		if (!period) return null;

		const incr = period / 360;
		const points = [];
		let lastPoint;
		let point;
		let angle;
		let step;
		let total = 0;
		let angleToPrevious;
		const multiplyer = isFuture ? 1 : -1;
		const arrayAction = isFuture ? 'push' : 'unshift';
		for (let i = 0; total < 360; i++) {
			point = this.calculatePosition(startTime + (multiplyer * incr * i) / DAY);

			if (lastPoint) {
				angle = point.angleTo(lastPoint) * RAD_TO_DEG;
				//make sure we do not go over 360.5 
				if (angle > 1.3 || ((angle + total) > 360.5)) {
					for (let j = 0; j < angle; j++) {
						step = (incr * (i - 1)) + ((incr / angle) * j);
						point = this.calculatePosition(startTime + (multiplyer * step) / DAY);

						//when finishing the circle try to avoid going too far over 360 (break after first point going over 360)
						if (total > 358) {
							angleToPrevious = point.angleTo(points[0]) * RAD_TO_DEG;
							if ((angleToPrevious + total) > 360) {
								points[arrayAction](point);
								break;
							}
						}

						points[arrayAction](point);

					}
					total += point.angleTo(lastPoint) * RAD_TO_DEG;
					lastPoint = point;
					continue;
				}
				total += angle;
			}
			points[arrayAction](point);
			lastPoint = point;
		}
		return points;
	},

	afterTick(deltaT, isPositionRelativeTo) {
		if (!this.isCentral) {

			if (isPositionRelativeTo) {
				this.positionRelativeTo();
			}

			const relativeToPos = this.universe.getBody(this.relativeTo).getPosition();
			this.relativePosition.copy(this.position).sub(relativeToPos);
			this.movement.copy(this.relativePosition).sub(this.previousRelativePosition);
			this.speed = this.movement.length() / deltaT;
			this.angle += this.relativePosition.angleTo(this.previousRelativePosition);
			this.previousRelativePosition.copy(this.relativePosition);

			if (this.angle > CIRCLE) {
				this.angle = this.angle % CIRCLE;
				if (this.onRevolution) this.onRevolution();
			}
		}
		// if (this.customAfterTick) this.customAfterTick(deltaT);

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

	setVelocity(v) {
		this.absvelocity = v;
		this.relvelocity = v.clone();
	},

	addToAbsoluteVelocity(v) {
		if (!v) return;
		this.absvelocity = this.absvelocity || this.getRelativeVelocity();
		this.absvelocity.add(v);
	},

	//absolute velocity
	getAbsoluteVelocity() {
		return (this.absvelocity && this.absvelocity.clone()) || this.getRelativeVelocity();
	},

	//velocity relative to central body for this object's orbit
	getRelativeVelocity() {
		if (this.relvelocity) return this.relvelocity.clone();
		this.relvelocity = this.isCentral ? new Vector3() : this.orbitalElements.calculateVelocity(this.currentJD);
		return this.relvelocity.clone();
	},
	//return true/false if this body is orbiting the requested body
	isOrbitAround(celestial) {
		return celestial.name === this.relativeTo;
	},

	setQuaternion() {
		const qTilt = new Quaternion().setFromEuler(this.getTilt(QUARTER_CIRCLE));
		const qRot = new Quaternion().setFromEuler(new Euler(0, (this.baseMapRotation || 0) + this.getCurrentRotation() ), 0, 'XYZ');
		this.quaternion = new Quaternion().multiplyQuaternions(qTilt, qRot);
	},

	getQuaternion() {
		return this.quaternion.clone();
	},

	applyTransformationTo(object3D, withScale = true) {
		object3D.position.copy(this.getPosition().multiplyScalar(this.universe.data.scale));
		object3D.quaternion.copy(this.getQuaternion());
		if (withScale) {
			const s = this.universe.data.scale;
			object3D.scale.set(s, s, s);
		}
	},

	applyLocationOnBodyTransformation(object3D, longitute, latitude, altitude, north) {

		const scale = this.universe.data.scale;
		const radius = this.radius * KM + altitude;
		const spherical = LLSpherical.create(longitute, latitude, radius);
		const bodyCenterToLocation = spherical.toVector3();
		const y1 = new Vector3(0, 1, 0);
		const locationDirection = bodyCenterToLocation.clone().normalize();
		const rotationToFeedsOnGround = new Quaternion().setFromUnitVectors(y1, locationDirection);
		const orientationInHorizonthPlane = new Quaternion().setFromAxisAngle(y1, -north * RAD_TO_DEG);
		const bodyOrientation = this.getQuaternion();
		const bodyPosition = this.getPosition().multiplyScalar(this.universe.data.scale);

		const m2 = new Matrix4();
		const m1 = new Matrix4();

		m2.multiply(m1.identity().setPosition(bodyPosition));
		m2.multiply(m1.makeRotationFromQuaternion(bodyOrientation));
		m2.multiply(m1.identity().setPosition(bodyCenterToLocation));
		m2.multiply(m1.makeRotationFromQuaternion(rotationToFeedsOnGround));
		m2.multiply(m1.makeRotationFromQuaternion(orientationInHorizonthPlane));

		object3D.matrix.identity();
		object3D.applyMatrix(m2);

	},


    toJSON(json) {
		return {
			name: this.name,
			position: this.position.toArray(),
			quaternion: this.quaternion.toArray(),
			tilt: this.tilt,
			rotation: this.currentRotation,
			movement: this.movement.toArray(),
		}
    }


};
