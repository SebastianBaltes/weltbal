import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import {injectCelestialSystem} from './celestial-system';

// NOT WORKING!

AFRAME.registerComponent('celestial-location-test', {

    schema: {
        body: { type: 'string' }, 
        system: { type: 'string' },
        radius: { type: 'number', default: 1},
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const object3D = this.el.object3D;

            const info = this.celestialSystem.getObjectPositionInfo(data.body);
            const loc = info[data.system];
    
            const s = new LLSpherical();
    
            s.radius = data.radius;
    
            if (data.system=='azimuthal') {
                s.longitudeCW=loc.longitude;            
            } else {
                s.longitude=loc.longitude;            
            }
            
            s.latitude=loc.latitude;
    
            object3D.position.copy(s.toVector3());
    
            const zerov = new THREE.Vector3();
            object3D.lookAt(zerov);

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
