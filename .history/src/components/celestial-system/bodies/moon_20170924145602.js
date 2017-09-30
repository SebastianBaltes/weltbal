import { DAY } from '../constants';
import MoonRealOrbit from './moon/OsculatingOrbit';
import { ELP82B } from './moon/elp';

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
	useCustomComputation: false,
	maxPrecision: true,
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

	// Achtung: map rotation correction?
};
