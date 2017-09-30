import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import * as THREE from 'three';

AFRAME.registerComponent('celestial-location', {

    schema: {
        latitude: { type: 'string', default: '0' },
        longitude: { type: 'string', default: '0' },
        north: { type: 'string', default: '0' },
        altitude: { type: 'number', default: 0 },
        radius: { type: 'number', default: 0 },
    },

    update()  {
        const d = this.data;
        
        const longitude = CoordinateParser.parse(d.longitude);
        let latitude = CoordinateParser.parse(d.latitude);
        latitude = Math.abs(latitude)>89.999 ? Math.sign(latitude) * 89.999 : latitude; 
        const north = CoordinateParser.parse(d.north);
        
        const standpointSpherical = LLSpherical.create(longitute, latitude, d.radius + d.altitude);
        const geoCenterToStandpoint = standpointSpherical.toVector3();
        const northSphericalDirection = LLSpherical.create(0, 90, 1).toVector3().normalize();
        
        const horizonthUpDirection = geoCenterToStandpoint.clone().normalize();
        const horizonthEastDirection = northSphericalDirection.clone().cross(horizonthUpDirection).normalize(); 
        const horizonthNorthDirection = horizonthUpDirection.clone().cross(horizonthEastDirection).normalize(); 
        
		const m2 = new THREE.Matrix4();
		const m1 = new THREE.Matrix4();

        m2.multiply(m1.makeBasis(horizonthEastDirection,horizonthUpDirection,horizonthNorthDirection));
        m2.multiply(m1.makeRotationAxis ( new THREE.Vector3(0,1,0), THREE.Math.degToRad(north) ));
		m2.multiply(m1.identity().setPosition(geoCenterToStandpoint));

        console.log({longitude,latitude,north,m2});

        const object3D = this.el.object3D;
        object3D.matrix.identity();
		object3D.applyMatrix(m2);
        
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
