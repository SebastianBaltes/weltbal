import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import * as THREE from 'three';
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-location', {

    schema: {
        position:  { type: 'boolean', default: true },
        quaternion:  { type: 'boolean', default: true },
    },

    init()  {
        this.matrix = new THREE.Matrix4();
        this.locationInitialized = false;
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const object3D = this.el.object3D;
            const observer = this.celestialSystem.observer;
            if (data.quaternion) {
                object3D.quaternion.copy(observer.quaternion);                
            }
            if (data.position) {
                object3D.position.copy(observer.position);
            }
        }
    },

});
