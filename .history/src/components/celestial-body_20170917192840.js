import celestialSystem from './celestial-system';

AFRAME.registerComponent('celestial-body', {

    schema: { type: 'string' },

    init() {
        celestialSystem.injectWhenReady(this);
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
