import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import * as THREE from 'three';
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-location', {

    schema: {
    },

    init()  {
        this.matrix = new THREE.Matrix4();
        this.initialized = false;
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            if (!this.initialized) {
                this.updateLocation();
                scene.addEventListener('celestial-system-update', ()=>this.updateLocation());
            }
            const {longitude,latitude,body,altitude,north} = this.celestialSystem.location;
            const atBody = this.celestialSystem.getBody(body);

            const object3D = this.el.object3D;
            object3D.matrix.compose( atBody.position, atBody.quaternion, new THREE.Vector3(1,1,1) );
            object3D.matrix.multiply( this.matrix );
            object3D.matrix.decompose(object3D.position,object3D.quaternion,object3D.scale);
        }
    },

    updateLocation() {
        const {longitude,latitude,body,altitude,north} = this.celestialSystem.location;
        const atBody = this.celestialSystem.getBody(body);
        console.log('updateLocation',JSON.stringify(atBody));
        

        const standpointSpherical = LLSpherical.create(longitude, latitude, atBody.radius + altitude);
        const geoCenterToStandpoint = standpointSpherical.toVector3();
        const northSphericalDirection = LLSpherical.create(0, 90, 1).toVector3().normalize();
        
        const horizonthUpDirection = geoCenterToStandpoint.clone().normalize();
        const horizonthEastDirection = northSphericalDirection.clone().cross(horizonthUpDirection).normalize(); 
        const horizonthNorthDirection = horizonthUpDirection.clone().cross(horizonthEastDirection).normalize(); 
        const horizontSouthDirection = horizonthNorthDirection.clone().multiplyScalar(-1); 

        const m1 = new THREE.Matrix4();

        this.matrix.identity();
        this.matrix.multiply(m1.identity().setPosition(geoCenterToStandpoint));
        this.matrix.multiply(m1.makeBasis(horizonthEastDirection,horizonthUpDirection,horizontSouthDirection));
        this.matrix.multiply(m1.makeRotationAxis ( new THREE.Vector3(0,1,0), THREE.Math.degToRad(north+180) ));
        this.initialized = true;
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
