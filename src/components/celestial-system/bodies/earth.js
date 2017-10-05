import * as THREE from 'three';
import { J2000, AU, SIDEREAL_DAY, NM_TO_KM, CIRCLE, YEAR, DAY, DEG_TO_RAD, QUARTER_CIRCLE } from '../constants';
import { J2000Date, getDeltaT } from '../utils/JD';
import { VSOP } from './earth/VSOP-earth';

export const earth = {
	title: 'The Earth',
	name: 'earth',
	mass: 5.9736e24,
	radius: 6378.137,
	color: '#1F7CDA',
	//voir https://visibleearth.nasa.gov/view_cat.php?categoryID=1484 pour changer
	map: './img/earthmap1k_clouds.jpg',
	siderealDay: SIDEREAL_DAY,
	maxPrecision: true,

	// baseMapRotation: THREE.Math.degToRad(-106), //THREE.Math.degToRad(-9.8), //THREE.Math.degToRad(-10/360), // THREE.Math.degToRad(196.637)
	baseMapRotation: THREE.Math.degToRad(190.5),
	tilt: 23 + (26 / 60) + (21 / 3600),
	positionCalculator: VSOP,
	hasGeoposCam: true,

	orbit: {
		base: {
			a: 1.00000261 * AU,
			e: 0.01671123,
			i: -0.00001531,
			l: 100.46457166,
			lp: 102.93768193,
			o: 0.0,
		},
		cy: {
			a: 0.00000562 * AU,
			e: -0.00004392,
			i: -0.01294668,
			l: 35999.37244981,
			lp: 0.32327364,
			o: 0.0,
		},
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
		if (this.tiltQuaternionJ2000Equinox) {
			this.tiltQuaternion.copy(this.tiltQuaternionJ2000Equinox);
		}
	},

	setRotation() {
		// https://www.physicsforums.com/threads/planets-and-suns-mean-angular-velocity.460887/
		// Earth = 7.292115053925690e-05, Jupiter = 1.773408215404907e-04, 
		// Mars = 7.088218127178316e-05, Mercury = 1.240013441242619e-06, 
		// Moon = 2.661699538941653e-06, Neptune = 1.083382527619075e-04, 
		// Pluto = -1.295641039282477e-05 Saturn = 1.636246173744684e-04, 
		// Sun = 2.865329607243705e-06, Uranus = -1.041365902144588e-04

		// ftp://tai.bipm.org/iers/conv2003/chapter1/tn32_c1.pdf
		const radPerSeconds = 7.292115e-5;
		const secondsPerDay = 60 * 60 * 24;
		const radSinceJ2000 = (this.jd-J2000) * secondsPerDay * radPerSeconds;
		this.rotation.angle = this.baseMapRotation + radSinceJ2000;
	},


    // setObliquity() {
    //     // JPL's fundamental ephemerides have been continually updated. The
    //     // Astronomical Almanac for 2010 specifies:
    //     const T = this.T;
    //     this.obliquity = 23.0 + 26.0 / 60.0 + (21.406 - (46.836769 - (0.0001831 + (0.00200340 - (0.576e-6 - 4.34e-8 * T) * T) * T) * T) * T) / 3600.0;
    // }



	// setTilt() {
	// 	const obliquity = this.universe.obliquity;
	// 	const xAxis = this.universe.dirSunEarthJ2000Equinox 
	// 				  ? this.universe.dirSunEarthJ2000Equinox
	// 				  : new THREE.Vector3(1,0,0);
	// 	// // TODO precession, nutation
	// 	this.tiltQuaternion.setFromAxisAngle( 
	// 		xAxis, 
	// 		THREE.Math.degToRad(this.tilt) ); 
	// },
	// setRotation() {
	// 	// ftp://tai.bipm.org/iers/conv2003/chapter1/tn32_c1.pdf
	// 	const radPerSeconds = 7.292115e-5;
	// 	const secondsPerDay = 60 * 60 * 24;
	// 	const radSinceJ2000 = (this.jd-J2000) * secondsPerDay * radPerSeconds;
	// 	this.rotation.angle = this.baseMapRotation + radSinceJ2000;
	// },
};
