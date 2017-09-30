import CoordinateParser from '../commons/CoordinateParser';
import { Math } from "three";

AFRAME.registerComponent('spherical-rotation', {
    schema: {
        // 0 to 360: coordinate that specifies the east-west position of a point on the spheres surface. It is an angular measurement, usually expressed in degrees and denoted by the Greek letter lambda (λ).
        longitude: {type: 'number', default: 0},

        // -90 to 90: +90° (zenith / up) to 0° (equator) to -90° (nadir / down)
        latitude: {type: 'number', default: 0},

        // 0 to 360: rotate around axis of sight, 0 is up (zenith)
        around: {type: 'number', default: 0},

        longitudeClockwise: {type: 'boolean', default: false},
        
    },

    update() {

        const data = this.data;
        const object = this.el.object3D;

        const longitude = CoordinateParser.parse(data.longitude);

        object.quaternion.setFromEuler (
            new THREE.Euler(
                Math.degToRad(CoordinateParser.parse(data.latitude)),
                Math.degToRad(data.longitudeClockwise ? (360-longitude)%360 : longitude),
                Math.degToRad(CoordinateParser.parse(data.around)), 'XYZ' ) );

    },

});
