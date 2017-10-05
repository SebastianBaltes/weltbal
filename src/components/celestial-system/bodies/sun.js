
export const radius = 6.96342e5;

export const sun = {
	title: 'The Sun',
	name: 'sun',
	mass: 1.9891e30,
	radius,
	color: '#ffff00',
	map: './img/sunmap.jpg',
	k: 0.01720209895, //gravitational constant (μ)
	isCentral: true,
	"rotation": {
		// In hours
		"period": 24.47*24,
		// Angle between equatorial plane and orbital plane
		"axialtilt": 0,
		// Inclination of orbit plane with respect to ecliptic
		"ascendingnode": 0.0,		
		"inclination": 0,
		"meridianangle": 0
	},

};
