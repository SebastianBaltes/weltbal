import {injectCelestialSystem} from './celestial-system';
import {Vector3,Math} from 'three';

AFRAME.registerComponent('celestial-home', {
    schema: {
        body: {type:'string', default: 'earth'},
        radius: {type:'number', default: -1}
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const cdata = this.celestialSystem.location;
            const body = this.celestialSystem.getBody(data.body);
            const radius = data.radius==-1 ? body.radius : data.radius; 
            const object = this.el.object3D;
            const height = radius + cdata.altitude;

            // todo nur bei update service notwendig

            object.quaternion.setFromEuler (
                new THREE.Euler(
                    Math.degToRad(cdata.latitude),
                    Math.degToRad(cdata.longitude),
                    Math.degToRad(cdata.north), 'XYZ' ) ).inverse();

            object.position.set(0,-height,0);                    
        }
    },
});
