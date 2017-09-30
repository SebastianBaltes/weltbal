const fs = require('fs');
const path = require('path');
const request = require('request');
const child_process = require('child_process');

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

const all_hips = [
    {
        "id": "P/2MASS/color",
        "url": "http://alasky.u-strasbg.fr/2MASS/Color",
        "name": "2MASS colored",
        "maxOrder": 9,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/DSS2/color",
        "url": "http://alasky.u-strasbg.fr/DSS/DSSColor",
        "name": "DSS colored",
        "maxOrder": 9,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/DSS2/red",
        "url": "http://alasky.u-strasbg.fr/DSS/DSS2Merged",
        "name": "DSS2 Red (F+R)",
        "maxOrder": 9,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/Fermi/color",
        "url": "http://alasky.u-strasbg.fr/Fermi/Color",
        "name": "Fermi color",
        "maxOrder": 3,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/Finkbeiner",
        "url": "http://alasky.u-strasbg.fr/FinkbeinerHalpha",
        "maxOrder": 3,
        "frame": "galactic",
        "format": "jpg",
        "name": "Halpha"
    },
    {
        "id": "P/GALEXGR6/AIS/color",
        "url": "http://alasky.u-strasbg.fr/GALEX/GR6-02-Color",
        "name": "GALEX Allsky Imaging Survey colored",
        "maxOrder": 8,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/IRIS/color",
        "url": "http://alasky.u-strasbg.fr/IRISColor",
        "name": "IRIS colored",
        "maxOrder": 3,
        "frame": "galactic",
        "format": "jpg"
    },
    {
        "id": "P/Mellinger/color",
        "url": "http://alasky.u-strasbg.fr/MellingerRGB",
        "name": "Mellinger colored",
        "maxOrder": 4,
        "frame": "galactic",
        "format": "jpg"
    },
    {
        "id": "P/SDSS9/color",
        "url": "http://alasky.u-strasbg.fr/SDSS/DR9/color",
        "name": "SDSS9 colored",
        "maxOrder": 10,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/SPITZER/color",
        "url": "http://alasky.u-strasbg.fr/SpitzerI1I2I4color",
        "name": "IRAC color I1,I2,I4 - (GLIMPSE, SAGE, SAGE-SMC, SINGS)",
        "maxOrder": 9,
        "frame": "galactic",
        "format": "jpg"
    },
    {
        "id": "P/VTSS/Ha",
        "url": "http://alasky.u-strasbg.fr/VTSS/Ha",
        "maxOrder": 3,
        "frame": "galactic",
        "format": "jpg",
        "name": "VTSS-Ha"
    },
    {
        "id": "P/XMM/PN/color",
        "url": "http://saada.unistra.fr/xmmpnsky",
        "name": "XMM PN colored",
        "maxOrder": 7,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/allWISE/color",
        "url": "http://alasky.u-strasbg.fr/AllWISE/RGB-W4-W2-W1/",
        "name": "AllWISE color",
        "maxOrder": 8,
        "frame": "equatorial",
        "format": "jpg"
    },
    {
        "id": "P/GLIMPSE360",
        "url": "http://www.spitzer.caltech.edu/glimpse360/aladin/data",
        "name": "GLIMPSE360",
        "maxOrder": 9,
        "frame": "equatorial",
        "format": "jpg"
    }
];


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

    const tilePath = (norder, npix) => {
        const dirIdx = Math.floor(npix/10000)*10000;
        return norderPath(norder) + "/Dir" + dirIdx + "/Npix" + npix + "." + hips.format;
    }

    ['Moc.fits'].forEach(file=>downloadPath('/'+file));
    ['Allsky.'+hips.format,'properties','metadata.fits','metadata.xml','metadata.cube'].forEach(file=>downloadPath('/'+file));
    for (let depth=0;depth<=Math.min(maxDepth,hips.maxOrder);depth++) {
        console.log('download level: ',depth,' images: ',nPixMax(depth));
        ['Allsky.'+hips.format,'properties','metadata.fits','metadata.xml','metadata.cube'].forEach(file=>downloadPath(norderPath(depth)+'/'+file));
        for (let i=0;i<nPixMax(depth);i++) {
            downloadPath(tilePath(depth,i));
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
console.log('#### starting, files to slurp: ',downloadlist.length);
for (let i=0;i<2;i++) {
    nextDownload();
}

