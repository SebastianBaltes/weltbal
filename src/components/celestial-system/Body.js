import '../../commons/three.toString';
import '../../commons/three.patch';
import * as THREE from 'three';

export default class Body {

    constructor() {
        this.name = null;
        this.radius = 0;
        this.position = new THREE.Vector3();
        this.tilt = new THREE.Quaternion();        
        this.rotation = 0;
        this.quaternion = new THREE.Quaternion();        
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
        this.radius = c.radius;        
        this.position.copy(c.position);
        this.tilt.copy(c.tilt);
        this.rotation = c.rotation;
        this.updateQuaternion();
        return this;
    }

    fromJSON(json) {
        let c = 0;
        this.name = json[c++];
        this.radius = json[c++];        
        this.position.fromArray(json[c++]);
        this.tilt.fromArray(json[c++]);
        this.rotation = json[c++];
        this.updateQuaternion();
        return this;
    }

    updateQuaternion() {
        this.quaternion.copy(this.tilt).rotateY(this.rotation);
    }

}