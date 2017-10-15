const Jimp = require("jimp");
const fs = require('fs');
const path = require('path');
const request = require('request');
const child_process = require('child_process');
const PropertiesReader = require('properties-reader');
const {
    mkdir,
    nPixMax,
    norderPath,
    tilePath,
    tiles,
    globHibsFolders
} = require('./common');

const depth = 3;
const outputSizes = [4096,2048,1024,512,256,128];

const inDir = 'hips';
const outDir = 'server/img/healpix/';

async function generateCompositeImages(inDir, outDir) {

    const format = ['jpg','png'].find(f=>fs.existsSync(inDir + tilePath(depth, 0)+'.'+f));
    if (format==null) {
        return Promise.resolve(null);
    }
    const imageFile = inDir + tilePath(depth, 0) + '.' + format;
    
    const exampleImage = await Jimp.read(imageFile);
    
    const width = exampleImage.bitmap.width;
    const fullWidth = width*Math.pow(2,depth);
    const usedSizes = outputSizes.filter(w=>w<=fullWidth);

    const outDirForSize = (size) => outDir + '/' + size;
    usedSizes.forEach(size=>{
        mkdir(outDirForSize(size));
    });

    // const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);

    for (let i=0;i<12;i++) {
        const list = [];
        tiles(list, i, 0, 0, 0);
        const composite = await new Jimp(fullWidth, fullWidth);
        for (let tile of list) {
            const fileName = inDir + tilePath(tile.d, tile.i) + '.' + format;
            if (fs.existsSync(fileName)) {
                const tileImage = await Jimp.read(fileName);
                composite.composite( tileImage, tile.px * width, tile.py * width);    
            } else {
                console.log('MISSING IMAGE: '+fileName);
            }
        }
        composite.mirror( false, true );
        composite.rotate( 90 );

        for (let size of usedSizes) {
            const out = outDirForSize(size)+'/'+i+'.jpg';
            console.log(out);
            const clone = composite.clone();
            clone.resize( size, size );
            await clone.write(out);
        }
    }

}

async function slurpAllHipsFolders() {
    const hibsFolders = globHibsFolders(inDir);

    for (let dir of hibsFolders) {
        console.log('hips: '+dir);

        const properties = PropertiesReader(dir+'/properties').getAllProperties();

        const name = dir.replace(/[^A-Z0-9_]+/ig,'_');

        if (!(/jpeg|png/.test(properties['format']))) {
            continue;
        }

        console.log('has jpeg/png and properties, new name: '+name);

        const outHealpixFolder = outDir + name;

        mkdir(outHealpixFolder);
        fs.writeFile(outHealpixFolder+'/properties.json', JSON.stringify(properties),()=>{});

        await generateCompositeImages(dir, outHealpixFolder);

        // const name =  properties.get('some.property.name');
    }

}

slurpAllHipsFolders().then(()=>console.log('ready'));

