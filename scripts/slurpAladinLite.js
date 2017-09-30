const fs = require('fs');
const path = require('path');
const request = require('request');
const child_process = require('child_process');
const all_hips = require('./surveys.json');

const maxDepth = 3;

const localFolder = 'hips/';

const makedDirs = new Set();

const mkdir = dir => {
    if (makedDirs.has(dir)) {
        return;
    }
    makedDirs.add(dir);
    console.log('mkdir -p '+dir);
    child_process.execSync('mkdir -p '+dir);
}

const downloadlist = [];

all_hips.forEach(hips=>{
    const downloadPath = p => {
        const url = hips.url+p;
        // console.log(url);
        const file = localFolder+hips.url.split('//')[1]+p;
        console.log(file);
        downloadlist.push({url,file});
    }

    const nPixMax = norder => norder==0 ? 12 : nPixMax(norder-1)*4;

    const norderPath = norder => "/" + "Norder" + norder;

    const tilePath = (norder, npix, format) => {
        const dirIdx = Math.floor(npix/10000)*10000;
        return norderPath(norder) + "/Dir" + dirIdx + "/Npix" + npix + "." + format;
    }

    const formats = hips.format.split(' ').map(x=>x=='jpeg'?'jpg':x); 

    ['Moc.fits'].forEach(file=>downloadPath('/'+file));
    formats.map(f=>'Allsky.'+f).concat(['properties','metadata.fits','metadata.xml','metadata.cube']).forEach(file=>downloadPath('/'+file));
    for (let depth=0;depth<=Math.min(maxDepth,hips.maxOrder);depth++) {
        console.log('download level: ',depth,' images: ',nPixMax(depth));
        formats.map(f=>'Allsky.'+f).concat(['properties','metadata.fits','metadata.xml','metadata.cube']).forEach(file=>downloadPath(norderPath(depth)+'/'+file));
        for (let i=0;i<nPixMax(depth);i++) {
            formats.forEach(format=>downloadPath(tilePath(depth,i,format)));
        }
    }
});


const lll = (m,c) => {
    return ()=> {
        console.log(m);
        c();
    }
}

const download = (url,file) => {
    const r = request(url);
    r.pause();
    r.on('response', (resp) => {
        if (resp.statusCode === 200){
            const dir = path.dirname(file);
            mkdir(dir);
            r.pipe(fs.createWriteStream(file));
            r.resume();
            console.log(url);
        } else {
            console.log('status!',resp.statusCode);
            nextDownload();
        }
    });
    r.on('end', lll('end',()=>nextDownload()));
    r.on('timeout', lll('timeout',()=>nextDownload()));
    r.on('error', lll('error',()=>nextDownload()));
}

const nextDownload = ()=>{
    const first = downloadlist.shift();
    if (first) {
        console.log('try download',first.url);
        download(first.url,first.file);
    } else {
        console.log('*** end!');
    }
}

// starte n parallele Downloads
const parallel = 5;
console.log('#### starting, files to slurp: ',downloadlist.length);
for (let i=0;i<parallel;i++) {
    nextDownload();
}

