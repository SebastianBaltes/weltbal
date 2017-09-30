
AFRAME.registerComponent('axis-helper', {

    schema: { 
        size: { type:"number", default: 1 } 
    },

    init() {
        this.el.object3D.add(new THREE.AxisHelper(this.data.size));
    },

});
