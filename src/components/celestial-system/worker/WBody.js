
import OrbitalElements from '../algorithm/OrbitalElements';
import { RAD_TO_DEG, CIRCLE, QUARTER_CIRCLE, DAY, J2000, KM, J2000_DATE_MS, OBLIQUITY_DEG_J2000 } from '../constants';
import {getDeltaT} from '../utils/JD';
import LLSpherical from '../../../commons/LLSpherical';
import {toThreeJsConventionXYZ}  from '../../../commons/Utils';
import * as THREE from 'three';
import '../../../commons/three.toString';
import '../../../commons/three.patch';

export default {

	isCentral: false,
	baseMapRotation: 0,
	siderealDay: 0,

	init(universe) {
		this.tiltQuaternion = new THREE.Quaternion();
		this.rotation.angle = 0;
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
			? new THREE.Vector3() 
			: toThreeJsConventionXYZ(this.orbitalElements.calculatePosition(this.jd, 
				this.universe.maxPrecision && this.maxPrecision));

		if (this.relativeToBody) {
			this.position.add(this.relativeToBody.position);
		}

	},

	setTilt() {
	},

    setRotation() {
	},

	toJSON() {
		return [this.name,this.radius*KM,this.position.toArray(),this.tiltQuaternion.toArray(),this.rotation.angle];
    },


};
