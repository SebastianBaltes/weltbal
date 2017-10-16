const Jimp = require("jimp");
const fs = require('fs');
const path = require('path');
const {
    mkdir,
} = require('./common');

async function scaleTiles(directory,inputSize,outputSizes) {    
    for (let i=0;i<12;i++) {
        const fullImage = await Jimp.read(directory+'/'+inputSize+'/'+i+'.jpg');
        for (let size of outputSizes) {
            const clone = fullImage.clone().resize( size, size );
            mkdir(directory+'/'+size);
            console.log('write '+directory+'/'+size+'/'+i+'.jpg');
            await clone.write(directory+'/'+size+'/'+i+'.jpg');
        }
    }
}

scaleTiles('server/img/healpix/hips_MellingerRGB_without_stars',2048,[1024,512,256,128]).then(()=>console.log('ready'));

