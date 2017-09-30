AFRAME.registerComponent('polar-grid-helper', {
    
    schema: { 
        radius: { type:"number", default: 1 }, 
        radials: { type:"number", default: 10 }, 
        circles: { type:"number", default: 10 }, 
        divisions: { type:"number", default: 64 }, 
        color1: { type:"color", default: '#444444' }, 
        color2: { type:"color", default: '#888888' },
    },

    init() {
        const {radius, radials, circles, divisions, color1, color2} = this.data;
        this.el.object3D.add(new THREE.PolarGridHelper( radius, radials, circles, divisions, color1, color2 ));
    },

});
