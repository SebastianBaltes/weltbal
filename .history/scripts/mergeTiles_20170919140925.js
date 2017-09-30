var Jimp = require("jimp");
const fs = require('fs');
const path = require('path');
const request = require('request');
const child_process = require('child_process');
const PropertiesReader = require('properties-reader');

const depth = 3;
const outputSizes = [2048,1024,512,256,128];

const inDir = 'hips';
const outDir = 'server/img/healpix/';

const makedDirs = new Set();

const mkdir = dir => {
    if (makedDirs.has(dir)) {
        return;
    }
    makedDirs.add(dir);
    console.log('mkdir -p '+dir);
    child_process.execSync('mkdir -p '+dir);
}

const globHibsFolders = (dir,results=[]) => {
    const list = fs.readdirSync(dir);
    if (list.includes('properties')) {
        results.push(dir);
    } else {
        list.forEach(file => {
            const fileAbsolute = dir + '/' + file;
            const stat = fs.statSync(fileAbsolute);
            if (stat.isDirectory()) {
                globHibsFolders(fileAbsolute,results);
            }
        });
    }
    return results;
}


const nPixMax = norder => norder==0 ? 12 : nPixMax(norder-1)*4;

const norderPath = norder => "/Norder" + norder;

const tilePath = (norder, npix) => {
    const dirIdx = Math.floor(npix/10000)*10000;
    return norderPath(norder) + "/Dir" + dirIdx + "/Npix" + npix;
}


const tiles = (list,i,d,px,py) => {
    if (d==depth) {
        list.push({i,d,px,py});
        return;
    }
    [
        {j:0,x:0,y:0},
        {j:1,x:0,y:1},
        {j:2,x:1,y:0},
        {j:3,x:1,y:1}
    ].forEach(({j,x,y})=> {
        tiles(list,i*4+j,d+1,x+px*2,y+py*2);
    });
}

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
                console.log('MISSING IMAGE: '+tileImage);
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

