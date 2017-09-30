AFRAME.registerShader('phong', {

    schema: {
        src:  { type: 'asset' },
        normalMap:  { type: 'asset' },
    },

    init: function (data) {
        const textureLoader = new THREE.TextureLoader();
        this.material = new THREE.MeshPhongMaterial({
            map: textureLoader.load( data.src ),
            normalMap: textureLoader.load( data.normalMap ),
        });
    },
});