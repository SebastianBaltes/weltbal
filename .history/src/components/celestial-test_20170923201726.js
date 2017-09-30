import CoordinateParser from '../commons/CoordinateParser';
import LLSpherical from "../commons/LLSpherical";
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-test', {

    schema: {
        body: { type: 'string' }, 
        color: { type: 'string' },
        radec: { type: 'string' },
        az: { type: 'string' },
    },

    init()  {
        const hFrame = document.querySelector('#horizontal-reference-frame');
        const eFrame = document.querySelector('#equatorial-reference-frame');
        const gFrame = document.querySelector('#galactic-reference-frame');

        const frames = [
            {
                frame:'#horizontal-reference-frame',
                opacity: 0.2,
                radius: 2500,
                system: 'azimuthal',
                cords: 'az',
            },
/*
            {
                frame:'#equatorial-reference-frame',
                opacity: 0.3,
                radius: 2000,
                system: 'equatorial',
                cords: 'radec',
            },
            {
                frame:'#galactic-reference-frame',
                opacity: 0.7,
                radius: 1500,
                system: 'galactic',
            },
*/
        ];

        const d = this.data;

        frames.forEach(f=>{
            $('#horizontal-reference-frame').append(
                $(`<a-plane color="${d.color}" 
                            material="side:double;" 
                            width="${f.radius}" 
                            height="${f.radius}" 
                            celestial-location-test="body: ${d.body}; system: ${f.system}; radius: 100000;"
                            ></a-plane>`)
            );
            
            if (f.cords && d[f.cords]) {
                const cords = d[f.cords].split('/').map(CoordinateParser.parse);
                console.log(d.body,f.cords,cords.map(x=>x.toFixed(2)).join(' / '));
                $(f.frame).append(
                    $(`<a-plane color="${d.color}" 
                                material="wireframe:true;" 
                                width="${f.radius}" 
                                height="${f.radius}" 
                                spherical-coords="longitude: ${cords[0]}; latitude: ${cords[1]}; radius: 100000; longitudeClockwise:${f.system=='azimuthal'};"
                                ></a-plane>`)
                );
            } 

        });

    },

    tick() {
    },

});