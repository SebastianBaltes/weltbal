
import { AU, DAY } from '../constants';

export const mars = {
	title: 'Mars',
	name: 'mars',
	mass: 6.4185e23,
	radius: 3376,
	color: '#ff3300',
	map: './img/mars_1k_color.jpg',
	siderealDay: 1.025957 * DAY,
	orbit: {
		base: {
			a: 1.52371034 * AU,
			e: 0.09339410,
			i: 1.84969142,
			l: -4.55343205,
			lp: -23.94362959,
			o: 49.55953891,
		},
		cy: {
			a: 0.00001847 * AU,
			e: 0.00007882,
			i: -0.00813131,
			l: 19140.30268499,
			lp: 0.44441088,
			o: -0.29257343,
		},
	},
	"rotation": {
		// In hours			
		"period": 24.622962156,
		// Angle between equatorial plane and orbital plane
		"axialtilt": 25.19,
		// Inclination of orbit plane with respect to ecliptic
		"inclination": 1.850,
		// "ascendingnode" : 47.68143,
		"ascendingnode" : 49.57854, 
		"meridianangle": 176.630
	},

};
