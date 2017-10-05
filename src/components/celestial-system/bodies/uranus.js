
import { AU } from '../constants';

export const uranus = {
	title: 'Uranus',
	name: 'uranus',
	mass: 8.6810e25,
	radius: 25559,
	color: '#99ccff',
	map: './img/uranusmap.jpg',
	orbit: {
		base: {
			a: 19.18916464 * AU,
			e: 0.04725744,
			i: 0.77263783,
			l: 313.23810451,
			lp: 170.95427630,
			o: 74.01692503,
		},
		cy: {
			a: -0.00196176 * AU,
			e: -0.00004397,
			i: -0.00242939,
			l: 428.48202785,
			lp: 0.40805281,
			o: 0.04240589,
		},
	},
	"rotation": {
		// In hours
		"period": 17.24,
		// Angle between equatorial plane and orbital plane
		"axialtilt": -97.77,
		// Inclination of orbit plane with respect to ecliptic
		"ascendingnode": 0.0,		
		"inclination": 0.772556,
		"meridianangle": 331.13
	},
};
