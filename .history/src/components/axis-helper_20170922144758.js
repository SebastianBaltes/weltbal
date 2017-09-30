
AFRAME.registerComponent('axis-helper', {

    schema: { 
        size: { type:"number", default: 1 } 
    },

    init() {
        const object3D = this.el.object3D;
        const size = this.data.size;
        object3D.add(new THREE.AxisHelper(size));
    },

});
