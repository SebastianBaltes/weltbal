
// Note: below figure and equations refer to:
//
// HEALPix: A Framework for High-Resolution Discretization and Fast
// Analysis of Data Distributed on the Sphere
//
// K. M. Górski et al. 2005 ApJ 622 759
// http://dx.doi.org/10.1086/427976

// Coordinates (divided by π) of southern corners of base tiles in
// projection of Fig. 5.
const basexys = [
    [0.25, 0],
    [0.75, 0],
    [1.25, 0],
    [1.75, 0],
    [0, -0.25],
    [0.5, -0.25],
    [1, -0.25],
    [1.5, -0.25],
    [0.25, -0.5],
    [0.75, -0.5],
    [1.25, -0.5],
    [1.75, -0.5]
];

function square(x) {
    return x * x;
}

function fmod(x, y) {
    let z = x % y;
    if (z < 0)
        z += y;
    return z;
}

function sign(x) {
    if (x < 0)
        return -1;
    if (x > 0)
        return 1;
    if (x == 0)
        return 0;
    return NaN;
}

function xy2zphi(x, y) {
    const abs_y = Math.abs(y);
    let z, phi;
    if (abs_y <= 0.25) {
        phi = Math.PI * x;
        z = 8 / 3 * y;
    } else {
        if (abs_y >= 0.5) {
            phi = 0;
        } else {
            phi = Math.PI * (x - (abs_y - 0.25) / (abs_y - 0.5) * (fmod(x, 0.5) - 0.25));
        }
        z = (1 - square(2 - 4 * abs_y) / 3) * sign(y);
    }
    return [z, phi];
}



export default class HEALPixMesh extends THREE.Object3D {

    constructor(radius, ndiv, materials) {
        super();
        ndiv = ndiv+1;

        console.log('healpix sphere with each ',square(ndiv) * 3 * 2 * 12,'vertices');

        basexys.forEach(([x0, y0], tileIndex) => {

            const indices = new Uint32Array(square(ndiv) * 3 * 2);
            const positions = new Float32Array(square(ndiv + 1) * 3);
            const uvs = new Float32Array(square(ndiv + 1) * 2);

            let ipos = 0;
            let iuv = 0;
            let iel = 0;
            for (let i = 0; i <= ndiv; i++) {
                for (let j = 0; j <= ndiv; j++) {
                    const zphi = xy2zphi(x0 + 0.25 * (i - j) / ndiv, y0 + 0.25 * (i + j) / ndiv);
                    const z = zphi[0];
                    const phi = zphi[1];
                    const root_1_minus_z2 = Math.sqrt(1 - square(z));
                    const x = Math.cos(phi) * root_1_minus_z2;
                    const y = Math.sin(phi) * root_1_minus_z2;
                    const s = i / ndiv;
                    const t = 1 - j / ndiv;
                    positions[ipos++] = y * radius;
                    positions[ipos++] = z * radius;
                    positions[ipos++] = x * radius;
                    uvs[iuv++] = s;
                    uvs[iuv++] = t;
                }
            }

            for (let i = 0; i < ndiv; i++) {
                for (let j = 0; j < ndiv; j++) {
                    indices[iel++] = (i + 0) * (ndiv + 1) + (j + 0);
                    indices[iel++] = (i + 1) * (ndiv + 1) + (j + 0);
                    indices[iel++] = (i + 0) * (ndiv + 1) + (j + 1);
                    indices[iel++] = (i + 0) * (ndiv + 1) + (j + 1);
                    indices[iel++] = (i + 1) * (ndiv + 1) + (j + 0);
                    indices[iel++] = (i + 1) * (ndiv + 1) + (j + 1);
                }
            }

            const geometry = new THREE.BufferGeometry();

            geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) );
            geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.addAttribute( 'uv',  new THREE.BufferAttribute( uvs, 2 ) );
            geometry.groups.push({start: 0, count: indices.count, index: 0});
            geometry.computeBoundingSphere();

            const mesh = new THREE.Mesh(geometry, materials[tileIndex]);

            this.add(mesh);
        });

    }

}

