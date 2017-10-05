import * as THREE from 'three';

const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);
const Q = new THREE.Quaternion();

if (THREE.Quaternion.prototype.reset===undefined) {
    THREE.Quaternion.prototype.reset = function (other) {
        return this.set(0,0,0,1);
    }    
}

if (THREE.Quaternion.prototype.getRotationFromMeTo===undefined) {
    THREE.Quaternion.prototype.getRotationFromMeTo = function (other) {
        return this.clone().inverse().multiply(other);
    }    
}

if (THREE.Quaternion.prototype.rotateX===undefined) {
    THREE.Quaternion.prototype.rotateX = function (angle) {
        return this.multiply(Q.setFromAxisAngle(X,angle));
    }    
}

if (THREE.Quaternion.prototype.rotateY===undefined) {
    THREE.Quaternion.prototype.rotateY = function (angle) {
        return this.multiply(Q.setFromAxisAngle(Y,angle));
    }    
}

if (THREE.Quaternion.prototype.rotateZ===undefined) {
    THREE.Quaternion.prototype.rotateZ = function (angle) {
        return this.multiply(Q.setFromAxisAngle(Z,angle));
    }    
}

