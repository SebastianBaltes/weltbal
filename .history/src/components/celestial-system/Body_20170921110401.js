import { Vector3, Euler, Quaternion, Matrix4 } from 'three';

export default class Body {

    constructor() {
        this.name = null;
        this.position = new Vector3();
        this.tilt = new Quaternion();        
        this.rotation = 0;        
    }

    interpolate(a,b,t,dt) {
        this.position.lerpVectors(a.position,b.position,t);
        this.tilt.copy(a.tilt).slerp(b.tilt,t);
        this.rotation = a.rotation * (1-t) + b.rotation * t;
        return this;
    }

    copy(c) {
        this.name = c.name;
        this.position.copy(c.position);
        this.tilt.copy(c.tilt);
        this.rotation = c.rotation;
        return this;
    }

    fromJSON(json) {
        this.name = json[0];
        this.position.fromArray(json[1]);
        this.tilt.fromArray(json[2]);
        this.rotation = json[3];
        return this;
    }

	applyTransformationTo(object3D) {
        object3D.position.copy(this.position);
        const rotation = new Quaternion().setFromEuler(new Euler(0, this.rotation, 0, 'XYZ'));
		object3D.quaternion.copy(this.tilt).multiply(rotation);
	}

	// applyLocationOnBodyTransformation(object3D, longitute, latitude, altitude, north) {

	// 	const scale = this.universe.data.scale;
	// 	const radius = this.radius * KM + altitude;
	// 	const spherical = LLSpherical.create(longitute, latitude, radius);
	// 	const bodyCenterToLocation = spherical.toVector3();
	// 	const y1 = new Vector3(0, 1, 0);
	// 	const locationDirection = bodyCenterToLocation.clone().normalize();
	// 	const rotationToFeedsOnGround = new Quaternion().setFromUnitVectors(y1, locationDirection);
	// 	const orientationInHorizonthPlane = new Quaternion().setFromAxisAngle(y1, -north * RAD_TO_DEG);
	// 	const bodyOrientation = this.getQuaternion();
	// 	const bodyPosition = this.getPosition().multiplyScalar(this.universe.data.scale);

	// 	const m2 = new Matrix4();
	// 	const m1 = new Matrix4();

	// 	m2.multiply(m1.identity().setPosition(bodyPosition));
	// 	m2.multiply(m1.makeRotationFromQuaternion(bodyOrientation));
	// 	m2.multiply(m1.identity().setPosition(bodyCenterToLocation));
	// 	m2.multiply(m1.makeRotationFromQuaternion(rotationToFeedsOnGround));
	// 	m2.multiply(m1.makeRotationFromQuaternion(orientationInHorizonthPlane));

	// 	object3D.matrix.identity();
	// 	object3D.applyMatrix(m2);

	// },

}