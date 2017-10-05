import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-body', {

    schema: { 
        name: { type: 'string' },
        perspective: { type: 'boolean', default: true },
        scale: { type: 'number', default: 1 },
    },

    init()  {
        injectCelestialSystem(this);
        this.i=0;
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const body = this.celestialSystem.getBody(data.name);
            
            const object3D = this.el.object3D;

            const {perspectivePosition,scale} =
                data.perspective 
                ? this.celestialSystem.perspective(body.position)
                : {perspectivePosition: body.position, scale: 1};

            object3D.position.copy(perspectivePosition);
            object3D.quaternion.copy(body.quaternion);

            const s = body.radius * scale * data.scale;
            
            //console.log(data.name,s);
            
            object3D.scale.set(s,s,s);
            
            // if (this.i++==100) {
            //     console.log(body.name,perspectivePosition,s,body.radius);
            // }
        }
    },

});
