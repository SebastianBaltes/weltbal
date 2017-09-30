var Jimp = require("jimp");
const fs = require('fs');
const path = require('path');

const inDir = 'server/img/healpix';

const globHibsFolders = (dir,results=[]) => {
    const list = fs.readdirSync(dir);
    if (list.includes('properties.json')) {
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

const hipsFolder = globHibsFolders(inDir);

console.log(hipsFolder);

const index = [];
for (let dir of hipsFolder) {
    const properties = JSON.parse(fs.readFileSync(dir+'/properties.json'));
    index.push({folder:dir,properties});
}

fs.writeFile(inDir+'/index.json', JSON.stringify(index,null,2),()=>{ console.log('ready.'); });
