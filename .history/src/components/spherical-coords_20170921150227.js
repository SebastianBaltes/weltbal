import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";

AFRAME.registerComponent('spherical-coords', {
    schema: {
        // The radius or radial distance is the Euclidean distance from the origin O to P.
        radius: {type: 'number', default: 0},

        // 0 to 360: coordinate that specifies the east-west position of a point on the spheres surface. It is an angular measurement, usually expressed in degrees and denoted by the Greek letter lambda (λ).
        longitude: {type: 'number', default: 0},

        // -90 to 90: +90° (zenith/north) to 0° (equator) to -90° (south)
        latitude: {type: 'number', default: 0},

        longitudeClockwise: {type: 'boolean', default: false},
    },

    update() {

        const data = this.data;
        const object3D = this.el.object3D;

        const s = new LLSpherical();

        s.radius = data.radius;

        if (data.longitudeClockwise) {
            s.longitudeCW=CoordinateParser.parse(data.longitude);            
        } else {
            s.longitude=CoordinateParser.parse(data.longitude);
        }
        
        s.latitude=CoordinateParser.parse(data.latitude);

        object3D.position.copy(s.toVector3());

        const zerov = new THREE.Vector3();
        object3D.lookAt(zerov);

    },

});
