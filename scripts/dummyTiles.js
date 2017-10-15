var Jimp = require("jimp");
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

const format = "jpg";

const outDir = 'server/img/healpix/dummy';

async function generateCompositeImages() {

    const fullWidth = 512;
    const width = fullWidth / Math.pow(2,depth);

    function createDefaultTile() {
        const img = new Jimp(fullWidth, fullWidth);
        const colors = [0,1,2,3].map(i=>{
            const c = 255*i/3;
            return Jimp.rgbaToInt(c,c,c,c);
        });
        const z = (x,y,n) => Math.min(x%n,y%n)<1 || Math.max(x,y)>fullWidth-4;
        for (let x=0;x<fullWidth;x++) {
            for (let y=0;y<fullWidth;y++) {
                const color =
                    z(x,y,256) ? 0 :
                        (z(x,y,128) ? 1 :
                            (z(x,y,64) ? 2 : 3));
                img.setPixelColor(colors[color], x, y);
            }
        }
        return img;
    }

    const baseTile = createDefaultTile();

    const outDirForSize = (size) => outDir + '/' + size;

    mkdir(outDirForSize(fullWidth));

    const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

    const n = 5;
    const m = 15;

    for (let i=0;i<12;i++) {
        const list = [];
        tiles(list, i, 0, 0, 0);
        const composite = await baseTile.clone();
        for (let tile of list) {
            composite.print(font, tile.px * width+n, tile.py * width+n+m*0, ''+tile.i);
            composite.print(font, tile.px * width+n, tile.py * width+n+m*1, ''+Math.floor(tile.i/4));
            composite.print(font, tile.px * width+n, tile.py * width+n+m*2, ''+Math.floor(tile.i/8));
        }
        composite.mirror( false, true );
        composite.rotate( 90 );

        const out = outDirForSize(fullWidth)+'/'+i+'.jpg';
        console.log(out);
        await composite.write(out);
    }

}

generateCompositeImages().then(()=>console.log('ready'));

