import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import * as THREE from 'three';
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-location', {

    schema: {
    },

    init()  {
        this.matrix = new THREE.Matrix4();
        this.locationInitialized = false;
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const object3D = this.el.object3D;
            object3D.matrix.copy(this.celestialSystem.observer.matrixWorld);
            object3D.matrix.decompose(object3D.position,object3D.quaternion,object3D.scale);
        }
    },

});
