import {celestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-body', {

    schema: { type: 'string' },

    tick() {
        if (celestialSystem.ready) {
            const name = this.data;
            const body = celestialSystem.getBody(name);
            const object = this.el.object3D;
            body.applyTransformationTo(object);
        }
    },

});
