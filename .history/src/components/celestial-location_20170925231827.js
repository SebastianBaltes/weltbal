import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import * as THREE from 'three';
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-location', {

    schema: {
        body: {type:'string', default: 'earth'},
    },

    init()  {
        injectCelestialSystem(this);
        const scene = document.querySelector('a-scene');
        scene.addEventListener('celestial-system-update', ()=>this.updateLocation());    
    },

    updateLocation() {
        const data = this.data;        
        const scene = document.querySelector('a-scene');
        const celestialSystem = scene.components['celestial-system'];
        const {longitude,latitude,radius,altitude,north} = celestialSystem.location;
        
        console.log(celestialSystem.location,{longitude,latitude});

        const standpointSpherical = LLSpherical.create(longitude, latitude, radius + altitude);
        const geoCenterToStandpoint = standpointSpherical.toVector3();
        const northSphericalDirection = LLSpherical.create(0, 90, 1).toVector3().normalize();
        
        const horizonthUpDirection = geoCenterToStandpoint.clone().normalize();
        const horizonthEastDirection = northSphericalDirection.clone().cross(horizonthUpDirection).normalize(); 
        const horizonthNorthDirection = horizonthUpDirection.clone().cross(horizonthEastDirection).normalize(); 
        const horizontSouthDirection = horizonthNorthDirection.clone().multiplyScalar(-1); 

        const m2 = new THREE.Matrix4();
        const m1 = new THREE.Matrix4();

        m2.multiply(m1.identity().setPosition(geoCenterToStandpoint));
        m2.multiply(m1.makeBasis(horizonthEastDirection,horizonthUpDirection,horizontSouthDirection));
        m2.multiply(m1.makeRotationAxis ( new THREE.Vector3(0,1,0), THREE.Math.degToRad(north+180) ));

        const body = celestialSystem.getBody(data.body);

        const object3D = this.el.object3D;
        object3D.scale.set(1,1,1);
        object3D.position.copy(body.position);
        object3D.quaternion.copy(body.quaternion);
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
