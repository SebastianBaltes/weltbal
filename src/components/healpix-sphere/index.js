import HEALPixMesh from "./HEALPixMesh";

AFRAME.registerComponent('healpix-sphere', {

    schema: {
        radius: {type: 'number', default: 1, min: 0},
        order: {type: 'number', default: 1, min: 0},
        urlpattern: {type: 'string'},
        detail: { type: 'number', default: 3 },
    },

    init() {
        const data = this.data;
        const object3D = this.el.object3D;

        this.materials = _.range(0,12).map((i)=>new THREE.MeshBasicMaterial({
            // color: Math.floor(Math.random() * 0xffffff),
            side: THREE.DoubleSide
        }));

        this.healpix_mesh = new HEALPixMesh(data.radius, data.detail, this.materials);

        object3D.add(this.healpix_mesh);
    },

    update() {
        const data = this.data;
        const object3D = this.el.object3D.children[0];

        if (!(data.urlpattern)) {
            return;
        }

        const textureLoader = new THREE.TextureLoader();
        // textureLoader.crossOrigin = "Anonymous";
        this.materials.forEach((material,i)=>{
            const url = data.urlpattern.replace(/#+/,match => {
                let s = i.toFixed();
                while (s.length<match.length) {
                    s='0'+s;
                }
                return s;
            });
            const texture = textureLoader.load(url);
            texture.anisotropy = 16;
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.LinearMipMapNearestFilter;
            material.map = texture;
            material.needsUpdate = true;
            return texture;
        });

    },

});
