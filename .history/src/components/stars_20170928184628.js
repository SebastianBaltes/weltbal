import * as THREE from 'three';
import starsFsh from '../shader/stars.fsh';
import starsVsh from '../shader/stars.vsh';

import LLSpherical from '../commons/LLSpherical';
import {toThreeJsConventionXYZ}  from '../commons/Utils';


//            X   Y  Z
// ["Polaris",101,79,9999,2,4]
// 43.71 / 89.26
// 2h54m50.61s / +89°15'51.4''
const toThreejsConv = v => {
    v = toThreeJsConventionXYZ(v);
    const o=v.x;
    v.x=v.z;
    v.z=-o;
    // v.z*=-1;
    return v;
}
// (9999.822,0.579,0.453)
// 9999.822,-51.968,89.265


//keys of the loaded array
const NAME = 0;
const X = 1;
const Y = 2;
const Z = 3;
const MAG = 4;
const SPECT = 5;

const MIN_MAG = -1.44;

const spectralColors = [
	0xfbf8ff,
	0xc8d5ff,
	0xd8e2ff,
	0xe6ecfc,
	0xfbf8ff,
	0xfff4e8,
	0xffeeda,
	0xfeead3,
	0xfccecb,
	0xebd3da,
	0xe7dbf3,
].map(c=>{
    const hsl = new THREE.Color(c).getHSL();
    hsl.s = 1;
    hsl.l = 0;
    return new THREE.Color().setHSL ( hsl.h, hsl.s, hsl.l ).getHex();
});


const namedStars = {};

const pxRatio = (window.devicePixelRatio || 1);

function lightenDarkenColor(hex, amount) {
	let col = [hex >> 16, (hex >> 8) & 0x00FF, hex & 0x0000FF];
	col = col.map(part => {
		const partTrans = part * amount;
		return partTrans < 0 ? 0 : (partTrans > 255 ? 255 : partTrans);
	});
	return (col[0] | (col[1] << 8) | (col[2] << 16));
}

let distanceMin = Number.POSITIVE_INFINITY;
let distanceMax = 0;

AFRAME.registerComponent('stars', {

    schema: {
        radius: { type:'number', default: 10000000 },
        src: { type: 'asset' },
        texture: { type: 'asset' },
        size: { type:'number', default: -1 },
        mag: { type:'number', default: Number.POSITIVE_INFINITY },
    },

    init() {
        const data = this.data;
        const texture = new THREE.TextureLoader().load( data.texture );
        $.get(data.src).then((stars)=>{
            stars = stars.filter(star=>star[X]!=0 && star[MAG]<data.mag);
            this.generate(stars,texture);
        });
    },

    generate(stars,texture)  {
        const data = this.data;
        const object = this.el.object3D;
        
        const geometry = new THREE.BufferGeometry();
        const count = stars.length;
    
        let star;
        let starVect;
        let mag;
        let name;
        let spectralType;
        let starColor;
        let color;

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
 

        for (let i = 0, i3 = 0; i < count; i++, i3 += 3) {
            star = stars[i];

            starVect = toThreejsConv(new THREE.Vector3(star[X], star[Y], star[Z]));

            const distance = starVect.length();
            distanceMin = Math.min(distanceMin,distance);
            distanceMax = Math.max(distanceMax,distance);

            starVect.normalize().multiplyScalar(data.radius);
    
            mag = (star[MAG] - MIN_MAG) + 1;
            name = star[NAME];
            starColor = spectralColors[star[SPECT]];
            if (name) {
                namedStars[name] = starVect;
                // console.log(name,new LLSpherical().fromVector3(toThreejsConv(starVect))+'');
            }

            // starColor = lightenDarkenColor(starColor, (1 / mag) ** 0.3); //((1 / mag) ** 0.3));

            if (mag < 7) {
                starColor = lightenDarkenColor(starColor, (1 / mag) ** 0.1); //((1 / mag) ** 0.3));
            } else {
                starColor = lightenDarkenColor(starColor, (1 / mag) ** 0.4); //((1 / mag) ** 0.9));
            }
    
            positions[i3 + 0] = starVect.x;
            positions[i3 + 1] = starVect.y;
            positions[i3 + 2] = starVect.z;
    
            color = new THREE.Color(starColor);
            colors[i3 + 0] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
    
            sizes[i] = data.size==-1 
                ? pxRatio * (1.5 + Math.floor(10 * (1 / mag) ** 0.1) / 10)
                : data.size;
    
        }
    
        geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
        // console.warn('voir exemple: view-source:https://threejs.org/examples/webgl_buffergeometry_custom_attributes_particles.html');
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                color: { type: 'c', value: new THREE.Color(0xffffff) },
                starTexture: { type: 't', value: texture },
            },
            vertexShader: starsVsh,
            fragmentShader: starsFsh,
            blending: THREE.AdditiveBlending,
            transparent: true,
        });
    
        const particleSystem = new THREE.Points(geometry, shaderMaterial);

        console.log('stars distance ',distanceMin,distanceMax);

        object.add(particleSystem);
    },
    
});
