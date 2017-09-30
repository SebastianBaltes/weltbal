// https://github.com/CoryG89/MoonDemo
// The MIT License (MIT)
// Copyright (c) 2013 Cory Gross

import vertexShader from '../shader/moon.vert';
import fragmentShader from '../shader/moon.frag';

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
    
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                lightPosition: {
                    type: 'v3',
                    value: sunLight.object3D.position
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
    
        const mesh = new THREE.Mesh(geo, mat);
        mesh.geometry.computeTangents();

        this.el.object3D.add(mesh);
    },

});
