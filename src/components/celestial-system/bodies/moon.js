import * as THREE from 'three';
import MoonRealOrbit from './moon/OsculatingOrbit';
import { ELP82B } from './moon/elp';
import { J2000, AU, SIDEREAL_DAY, NM_TO_KM, CIRCLE, YEAR, DAY, DEG_TO_RAD, QUARTER_CIRCLE } from '../constants';

export const moon = {
	title: 'The Moon',
	name: 'moon',
	mass: 7.3477e22,
	radius: 1738.1,
	color: '#aaaaaa',
	map: './img/moonmap4k_levels.jpg',
	siderealDay: (27.3215782 * DAY),
	tilt: 1.5424,
	fov: 1,
	relativeTo: 'earth',
	osculatingElementsCalculator: MoonRealOrbit,
	positionCalculator: ELP82B,
	useCustomComputation: true,
	maxPrecision: true,
	baseMapRotation: THREE.Math.degToRad(200),
	orbit: {
		tilt: false,
		base: {
			a: 384400,
			e: 0.0554,
			w: 318.15,
			M: 135.27,
			i: 5.16,
			o: 125.08,
		},
		day: {
			a: 0,
			e: 0,
			i: 0,
			M: 13.176358,
			w: (360 / 5.997) / 365.25,
			o: (360 / 18.600) / 365.25,
		},
	},
	rotation: {
		// In hours
		"period": 655.718,
		// Angle between equatorial plane and orbital plane
		"axialtilt": -1.542,
		// Inclination of orbital plane with respect to ecliptic 
		"inclination": 5.145,
		"ascendingnode": 359.9949,
		"meridianangle": 20.015
	},
	"rotation": {
		// In hours
		"period": 23.93447117,
		// Angle between equatorial plane and orbital plane
		// "axialtilt": -23.4392911,
		"axialtilt": -23.4392911,
		// Inclination of orbit plane with respect to ecliptic
		"inclination": 0.00005,
		"ascendingnode": 0, // ?		
		"meridianangle": 180 // 220 //64.5 // 180
	},
	
	setTilt() {
		this.tiltQuaternion.reset().rotateX(THREE.Math.degToRad(this.tilt));
	},

	setRotation() {
		// ftp://tai.bipm.org/iers/conv2003/chapter1/tn32_c1.pdf
		const radPerSeconds = 2.661699538941653e-06;
		const secondsPerDay = 60 * 60 * 24;
		const radSinceJ2000 = (this.jd-J2000) * secondsPerDay * radPerSeconds;
		this.rotation.angle = this.baseMapRotation + radSinceJ2000;
	},

};
