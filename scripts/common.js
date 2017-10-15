const Jimp = require("jimp");
const fs = require('fs');
const path = require('path');
const request = require('request');
const child_process = require('child_process');
const PropertiesReader = require('properties-reader');

const makedDirs = new Set();

const mkdir = dir => {
    if (makedDirs.has(dir)) {
        return;
    }
    makedDirs.add(dir);
    console.log('mkdir -p '+dir);
    child_process.execSync('mkdir -p '+dir);
}

const nPixMax = norder => norder==0 ? 12 : nPixMax(norder-1)*4;

const norderPath = norder => "/Norder" + norder;

const tilePath = (norder, npix) => {
    const dirIdx = Math.floor(npix/10000)*10000;
    return norderPath(norder) + "/Dir" + dirIdx + "/Npix" + npix + "." + format;
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


module.exports = {
    mkdir,
    nPixMax,
    norderPath,
    tilePath,
    tiles,
    globHibsFolders
}