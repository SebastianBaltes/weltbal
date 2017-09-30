
AFRAME.registerComponent('log', {
    
        schema: { 
            size: { type:"number", default: 1 } 
        },
    
        tick() {
            const object3D = this.el.object3D;
            console.log(this.el.getAttribute('id'),object3D.position,object3D.quaternion,object3D.scale);
        },
    
});
    