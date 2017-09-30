import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-location-test', {

    schema: {
        body: { type: 'string' }, 
        system: { type: 'string' },
        radius: { type: 'number', default: 1},
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const object3D = this.el.object3D;

            const info = this.celestialSystem.getObjectPositionInfo(data.body);

            this.i=(this.i||0)+1;
            if (this.i==100) {
                console.log(data.body,_.keys(info)
                    .map(k=>k+': '+info[k].longitude.toFixed(2)+' / '+info[k].latitude.toFixed(2)).join('\n'));
            }

            const loc = info[data.system];
    
            const s = new LLSpherical();
    
            s.radius = data.radius;
    
            if (data.system=='azimuthal') {
                s.longitudeCW=+180loc.longitude;            
            } else {
                s.longitude=loc.longitude;            
            }
            
            s.latitude=loc.latitude;
    
            object3D.position.copy(s.toVector3());
    
            const zerov = new THREE.Vector3();
            object3D.lookAt(zerov);

        }
    },

});