import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-body', {

    schema: { type: 'string' },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const name = this.data;
            const body = this.celestialSystem.getBody(name);
            const object = this.el.object3D;
            body.applyTransformationTo(object);
        }
    },

});
