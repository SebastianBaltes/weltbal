// https://github.com/CoryG89/MoonDemo
// The MIT License (MIT)
// Copyright (c) 2013 Cory Gross

import vertexShader from '../shader/moon.vsh';
import fragmentShader from '../shader/moon.fsh';

import * as THREE from 'three';

AFRAME.registerComponent('moon', {

    schema: {
        sunLight: { type: 'selector' },
        segments:  { type: 'number', default: 50 },
        radius:  { type: 'number', default: 1 },
        textureMap:  { type: 'asset' },
        normalMap:  { type: 'asset' },
    },

    init()  {
        const {radius,segments,sunLight,textureMap,normalMap} = this.data;

        const geo = new THREE.SphereGeometry(radius, segments, segments);
    
        let mat = new THREE.ShaderMaterial({
            uniforms: {
                lightPosition: {
                    type: 'v3',
                    value: new THREE.Vector3(), //sunLight.object3D.position
                },
                textureMap: {
                    type: 't',
                    value: textureMap
                },
                normalMap: {
                    type: 't',
                    value: normalMap
                },
                uvScale: {
                    type: 'v2',
                    value: new THREE.Vector2(1.0, 1.0)
                }
            },
            vertexShader,
            fragmentShader,
        });

        mat = new THREE.MeshBasicMaterial({color: 0xa0a0a0});
    
        const mesh = new THREE.Mesh(geo, mat);
        mesh.geometry.computeTangents();

        this.el.object3D.add(mesh);
    },

});
