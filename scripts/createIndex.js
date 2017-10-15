var Jimp = require("jimp");
const fs = require('fs');
const path = require('path');
const {
    mkdir,
    nPixMax,
    norderPath,
    tilePath,
    tiles,
    globHibsFolders
} = require('./common');

const inDir = 'server/img/healpix';

const hipsFolder = globHibsFolders(inDir);

console.log(hipsFolder);

const index = [];
for (let dir of hipsFolder) {
    const properties = JSON.parse(fs.readFileSync(dir+'/properties.json'));
    index.push({folder:dir,properties});
}

fs.writeFile(inDir+'/index.json', JSON.stringify(index,null,2),()=>{ console.log('ready.'); });
