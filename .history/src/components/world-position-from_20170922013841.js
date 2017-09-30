AFRAME.registerComponent('world-position-from', {
    schema: { type: 'selector' },
    tick() {
        const object = this.el.object3D;
        const targetPosition = this.data.object3D.getWorldPosition();

        object.parent.updateMatrixWorld();
        const parentMatrixWorld = object.parent.matrixWorld;
        const parentMatrixInverse = new THREE.Matrix4().getInverse(parentMatrixWorld, true);

        targetPosition.applyMatrix4(parentMatrixInverse);

        object.position.copy(targetPosition);
    },
});
