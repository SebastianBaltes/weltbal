import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-body', {

    schema: { 
        name: { type: 'string' },
        scale: { type: 'boolean', default: true },
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const body = this.celestialSystem.getBody(this.data.name);
            const object3D = this.el.object3D;

            const {distance,perspectiveDistance,perspectivePosition,scale} = this.celestialSystem.perspective(body.position);

            object3D.position.copy(perspectivePosition);
            object3D.quaternion.copy(body.quaternion);

            if (this.data.scale) {
                const s = body.radius * scale;
                object3D.scale.set(s,s,s);    

                console.log(body.name,perspectiveDistance);
            }
        }
    },

});
