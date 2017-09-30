
AFRAME.registerComponent('axis-helper', {

    schema: { 
        size: { type:"number", default: 1 } 
    },

    init() {
        const object3D = this.el.object3D;
        const size = this.data.size;
        
//      object3D.add(new THREE.AxisHelper(this.data.size));

        object3D.add(new THREE.ArrowHelper( new THREE.Vector3(1,0,0), new THREE.Vector2(0,0,0), size, 0xff0000 ));
        object3D.add(new THREE.ArrowHelper( new THREE.Vector3(0,1,0), new THREE.Vector2(0,0,0), size, 0x00ff00 ));
        object3D.add(new THREE.ArrowHelper( new THREE.Vector3(0,0,1), new THREE.Vector2(0,0,0), size, 0x0000ff ));
},

});
