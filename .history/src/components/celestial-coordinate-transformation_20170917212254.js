import LLSpherical from "../commons/LLSpherical";
import {Vector3,Matrix4,Quaternion,Math,Euler} from 'three';
import celestialSystem from './celestial-system';

const spherical = (longitute,latitude) => LLSpherical.create(longitute,latitude,1);

const makeRotationFromBasisSphericals = (...sphericals) => {
    const basis = sphericals.map(s=>s.toVector3());
    const m = new Matrix4().makeBasis( basis[0], basis[1], basis[2] );
    const quaternion = new Quaternion();
    m.decompose(new Vector3(), quaternion, new Vector3());
    return quaternion;
}

const rotationEquatorialToGalactic = makeRotationFromBasisSphericals(

    // Vector3 =>   Spherical radius,longitute,latitude
    // (1,0,0)      (1,90,0)
    // (0,1,0)      (1,0,90)
    // (0,0,1)      (1,0,0)
    // J2000
    // GAL                      =>  EQ
    // 90.00000000, 0.00000000      318.00456302, 48.32955335
    // 0.00000000, 90.00000000      192.85949646, 27.12835323
    // 0.00000000, 0.00000000       266.40506655, -28.93616241

    spherical(318.00456302, 48.32955335),
    spherical(192.85949646, 27.12835323),
    spherical(266.40506655, -28.93616241),
);

AFRAME.registerComponent('celestial-coordinate-transformation', {
    schema: {
        from: {type: 'string'},
        to: {type: 'string'},
    },

    init() {
        celestialSystem.injectWhenReady(this);
        const data = this.data;
        const object = this.el.object3D;
        const trans = data.from + '-' + data.to;
        if (trans=='vr-horizontal') {
            this.tick = ()=>{
                if (this.celestialSystem) {
                    const cdata = this.celestialSystem.data;                    
                    const locationQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1,0,0),cdata.north);
                    object.quaternion.copy(locationQuaternion);
                }
            };
        } else if (trans=='horizontal-equatorial') {
            this.tick = ()=>{
                if (this.celestialSystem) {
                    const cdata = this.celestialSystem.data;                    
                    const locationQuaternion = new Quaternion().setFromEuler (
                        new THREE.Euler(
                            Math.degToRad(cdata.latitude),
                            Math.degToRad(cdata.longitude),
                            Math.degToRad(cdata.north), 'XYZ' ) );
                            const earth = this.celestialSystem.getBody('earth');
                    const rotation = new Quaternion().setFromEuler(new Euler(0, earth.getCurrentRotation()), 0, 'XYZ').inverse();
                    object.quaternion.copy(locationQuaternion).multiply(rotation);
                }
            };
        } else if (trans=='equatorial-galactic') {
            object.quaternion.multiply(rotationEquatorialToGalactic);
        } else {
            throw new Error('unknown celestial transformation '+JSON.stringify(data));
        }
    },

});
