import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-body', {

    schema: { 
        name: { type: 'string' },
        scale: { type: 'boolean', default: true },
        perspective: { type: 'boolean', default: true },
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const body = this.celestialSystem.getBody(data.name);
            const object3D = this.el.object3D;

            const {perspectivePosition,scale} = data.perspective 
                ? this.celestialSystem.perspective(body.position)
                : {perspectivePosition: body.position, scale: 1};

            object3D.position.copy(perspectivePosition);
            object3D.quaternion.copy(body.quaternion);

            if (data.scale) {
                const s = body.radius * scale;
                console.log(body.name,s);
                object3D.scale.set(s,s,s);    
            }

        }
    },

});
