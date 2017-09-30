import THREE from 'three';

/**
 * Spherical with longitude / latitude conversion
 */
export default class LLSpherical extends THREE.Spherical {

    constructor(radius, phi, theta) {
        super(radius,phi,theta);
    }

    clone() {
        return new Spherical().copy(this);
    }

    toVector3() {
        return new THREE.Vector3().setFromSpherical(this);
    }

    fromVector3(v3) {
        return this.setFromVector3(v3);
    }

    get latitude() {
        return 90 - this.phi * 180 / Math.PI;
    }

    set latitude(v) {
        // 0 rad = north = +90°
        // pi rad = south = -90°
        this.phi = (90 - v) * Math.PI / 180;
    }

    get longitude() {
        // Achtung, positive longitude entspricht negativer x - Achse!
        // Longitude -180 ist die Richtung, in die die Kamera schaut.
        // Die Kamera schaut direkt auf ein Objekt, das Unterobjekt der Kamera ist und bei z=-1 positioniert ist.
        return this.theta * 180 / Math.PI;
    }

    set longitude(v) {
        this.theta = v * Math.PI / 180;
    }

    toString() {
        try {
            return '('+this.radius.toFixed(3)+','+this.longitude.toFixed(3)+','+this.latitude.toFixed(3)+')';
        } catch (e) {
            return '('+this.radius+','+this.longitude+','+this.latitude+')';
        }
    };

    static create(longitute,latitude,radius) {
        const s = new LLSpherical();
        s.radius = radius;
        s.longitude = longitute;
        s.latitude = latitude;
        return s;
    }

}

