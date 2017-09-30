AFRAME.registerComponent('world-quaternion-from', {
    schema: { type: 'selector' },
    tick() {
        const object = this.el.object3D;
        const parentQuaternion = object.parent.getWorldQuaternion();
        const targetQuaternion = this.data.object3D.getWorldQuaternion();
        object.quaternion.copy(parentQuaternion).multiply(parentQuaternion.inverse());
    },
});
