AFRAME.registerShader('phong', {

    schema: {
        src:  { type: 'asset' },
        normalMap:  { type: 'asset' },
        shininess: { type: 'number', default: 30 },
    },

    init: function (data) {
        const textureLoader = new THREE.TextureLoader();
        this.material = new THREE.MeshPhongMaterial({
            shininess: data.shininess,
            map: textureLoader.load( data.src ),
            normalMap: textureLoader.load( data.normalMap ),
        });
    },
});