import CoordinateParser from '../commons/CoordinateParser';
import {injectCelestialSystem} from './celestial-system';

// NOT WORKING!

AFRAME.registerComponent('celestial-location', {

    schema: {
        body: { type: 'string', default: 'earth' }, 
        latitude: { type: 'number', default: 0 },
        longitude: { type: 'number', default: 0 },
        altitude: { type: 'number', default: 0 },
        north: { type: 'number', default: 0 },
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const name = this.data.body;
            const body = this.celestialSystem.getBody(name);
            const object = this.el.object3D;
            body.applyLocationOnBodyTransformation(object,
                CoordinateParser.parse(data.longitude),
                CoordinateParser.parse(data.latitude),
                data.altitude,
                CoordinateParser.parse(data.north));
        }
    },

/*
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

*/

});
