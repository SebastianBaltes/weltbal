AFRAME.registerShader('phong', {

    schema: {
        textureMap:  { type: 'asset' },
        normalMap:  { type: 'asset' },
    },

    init: function (data) {
        const textureLoader = new THREE.TextureLoader();
        this.material = new THREE.MeshPhongMaterial({
            map: textureLoader.load( data.map ),
            normalMap: textureLoader.load( data.normalMap ),
        });
    },
});