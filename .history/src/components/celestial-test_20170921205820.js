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
                opacity: 0.3,
                radius: 3000,
                system: 'azimuthal',
            },
            {
                frame:'#equatorial-reference-frame',
                opacity: 0.5,
                radius: 2000,
                system: 'equatorial',
            },
            {
                frame:'#galactic-reference-frame',
                opacity: 1,
                radius: 1000,
                system: 'galactic',
            },
        ];

        const d = this.data;

        frames.forEach(f=>{
            $('#horizontal-reference-frame').append(
                $(`<a-circle color="${d.color}" 
                            material="opacity:${f.opacity};transparent:true;side:double;" 
                            radius="${f.radius}" 
                            celestial-location-test="body: ${d.body}; system: ${f.system}; radius: 100000;"
                            ></a-circle>`)
            );
            
            $(f.frame).append(
                $(`<a-plane color="${d.color}" 
                            material="opacity:${f.opacity};transparent:true;side:double;" 
                            width="${1.7*f.radius}" 
                            height="${1.7*f.radius}" 
                            spherical-coords="longitude: 288.265; latitude: 42.2766; radius: 100000; longitudeClockwise:${f.system=='azimuthal'};"
                            ></a-circle>`)
            );
        });

    },

    tick() {
    },

});