AFRAME.registerComponent('world-position-from', {
    schema: { type: 'selector' },
    tick() {
        const object = this.el.object3D;
        const parentPosition = object.parent.getWorldPosition();
        const targetPosition = this.data.object3D.getWorldPosition();
        object.position.copy(targetPosition).sub(parentPosition);
    },
});
