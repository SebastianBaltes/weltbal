import { Vector3, Euler, Quaternion, Matrix4 } from 'three';

export default class Body {

    constructor() {
        this.name = null;
        this.position = new Vector3();
        this.tilt = new Quaternion();        
        this.rotation = 0;
        this.quaternion = new Quaternion();        
    }

    interpolate(a,b,t) {
        this.position.lerpVectors(a.position,b.position,t);
        this.tilt.copy(a.tilt).slerp(b.tilt,t);
        this.rotation = a.rotation * (1-t) + b.rotation * t;
        this.updateQuaternion();
        return this;
    }

    copy(c) {
        this.name = c.name;
        this.position.copy(c.position);
        this.tilt.copy(c.tilt);
        this.rotation = c.rotation;
        this.updateQuaternion();
        return this;
    }

    fromJSON(json) {
        this.name = json[0];
        this.position.fromArray(json[1]);
        this.tilt.fromArray(json[2]);
        this.rotation = json[3];
        this.updateQuaternion();
        return this;
    }

    updateQuaternion() {
        this.quaternion.copy(this.tilt).multiply(new Quaternion().setFromEuler(new Euler(0, this.rotation, 0,  'XYZ')));
    }

	applyTransformationTo(object3D) {
        object3D.position.copy(this.position);
        object3D.quaternion.copy(this.quaternion);
	}

}