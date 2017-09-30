import "./style/index.scss";
import "aframe";
import "./commons/three.toString";

import "aframe-sun-sky";
import "aframe-environment-component";
import "aframe-log-component";
import "aframe-animation-component";

import './systems/celestial-system';

import "./components/spherical-coords";
import "./components/spherical-grid";
import "./components/copy-position";
import "./components/healpix-sphere/index";
import "./components/renderer-parameter-patch";
import "./components/celestial-coordinate-transformation";
import "./components/device-location-and-time";
import './components/spherical-rotation';
import './components/group-opacity';
import './components/celestial-body';
import './components/celestial-particles';
import './components/celestial-location';
import './components/celestial-home';
import './components/axis-helper';
import './components/world-quaternion-from';
import './components/world-position-from';
import './components/move-me-so-that';
import _ from 'lodash';

const coordinateGrid = ({id='grid',longitudeUnit='°', color='#aaa',opacity=0.1,radius=100,fontWidth=50}) => {
    const maxLongitude = longitudeUnit=='°' ? 360 : 24;
    const stepLongitude = longitudeUnit=='°' ? 10 : 360/24;
    const textSettings = `align: center; width: ${fontWidth}; color: ${color}; transparent: true; opacity: ${Math.min(1,opacity+0.5)};`;
    return `
        <a-entity id="${id}">
            <a-entity spherical-grid="radius: ${radius}; direction: longitude; from: 0; to: 359.999; step: ${stepLongitude}; color: ${color}; opacity: ${opacity}"></a-entity>
            ${_.range(0,359.999,stepLongitude).map(v=>
                `<a-entity text="value: ${(v*maxLongitude/360)+longitudeUnit}; ${textSettings}" spherical-coords="longitude: ${v}; latitude: 0; radius: ${radius};"></a-entity>`
            ).join('')}
    
            <a-entity spherical-grid="radius: ${radius}; direction: latitude; from: -80; to: 80; step: 10; color: ${color}; opacity: ${opacity}"></a-entity>
            ${_.without(_.range(-80,80.001,10),0).map(v=>
                `<a-entity text="value: ${v}; ${textSettings}" spherical-coords="longitude: 0; latitude: ${v}; radius: ${radius}"></a-entity>`    
            ).join('')}
        </a-entity>
    `;
};


const html = `

    <a-scene 
        id="horizontal-reference-frame"
        antialias="true" 
        celestial-system="scale: 1; scale-bodies: 1; scale-time: 1000; reposition-ms: 1000; 
                          latitude: 51.513587; longitude: 7.465298; altitude: 1000; north: 0;">

        <a-assets>
            <a-mixin id="CardinalCoordsSchema" text="align: center; width: 100; color: red; transparent: true; opacity: 0.2;" spherical-coords="latitude: 5; radius: 100;"></a-mixin>
            <a-mixin id="overlay-fade-in" animation="property: opacity; dir: normal; dur: 500; easing: easeOutQuad; loop: false; from:0; to: .75; startEvents: clickDown;"></a-mixin>
        </a-assets>

        <a-camera near="0.1" far="10000000000000000000" renderer-parameter-patch="logarithmicDepthBuffer: true">
        </a-camera>

        <a-entity laser-controls line="color: yellow; opacity: 0.75"></a-entity>
        
        <a-entity spherical-rotation="longitude: 180; latitude: 0;">
            <a-entity id="hudMenu">
            </a-entity>
        </a-entity> 

        <a-entity id="CardinalDirections">
            <a-text value="N" spherical-coords="longitude: 0;" mixin="CardinalCoordsSchema"></a-text>
            <a-text value="E" spherical-coords="longitude: 90;" mixin="CardinalCoordsSchema"></a-text>
            <a-text value="S" spherical-coords="longitude: 180;" mixin="CardinalCoordsSchema"></a-text>
            <a-text value="W" spherical-coords="longitude: 270;" mixin="CardinalCoordsSchema"></a-text>
        </a-entity>

        <a-entity id="earth-under-feet" celestial-home="body:earth;radius: 6378159.6564">
            <a-sphere id="inner-earth-core" segments-width="100" segments-height="100" color="red" material="side:double" radius="1230000"></a-sphere>
<!--
            <a-sphere id="outer-earth-core" segments-width="100" segments-height="100" color="yellow" material="transparent:true;opacity:0.5;side:double" radius="3471000"></a-sphere>
            <a-sphere id="earth-inner-mantel" segments-width="100" segments-height="100" color="orange" material="transparent:true;opacity:0.5;side:double" radius="5711000"></a-sphere>
            <a-sphere id="earth-outer-mantel" segments-width="100" segments-height="100" color="orange" material="transparent:true;opacity:0.5;side:double" radius="6336000"></a-sphere>
            <a-sphere id="earth-crust-mantel" segments-width="100" segments-height="100" color="black" material="transparent:true;opacity:0.5;side:double" radius="6378159.6564"></a-sphere>
            ${coordinateGrid({radius:6378200, opacity:1, id: "earthgrid"})}
            <a-entity axis-helper="size:6500000"></a-entity>
-->            
        </a-entity>

        <a-entity id="equatorial-reference-frame" world-position-from="a-camera" celestial-coordinate-transformation="from:horizontal;to:equatorial">

        ${coordinateGrid({longitudeUnit:'h',color:'#0ff'})}
            
            <a-entity id="stars" celestial-particles="data:server/jsorrery/data/milkyway_heasarc_204k.json"></a-entity>
            
            <a-entity id="universeSphere" healpix-sphere="radius: 1000000000000000000; detail: 6" celestial-coordinate-transformation="from:equatorial;to:galactic"></a-entity>
            
            <a-entity id="galactic-reference-frame" celestial-coordinate-transformation="from:equatorial;to:galactic">
                ${coordinateGrid({longitudeUnit:'°'})}
            </a-entity>

            </a-entity>

        <a-entity id="ecliptic-reference-frame" move-me-so-that="my:#earth-in-solar-system;is-at:#earth-under-feet">

            <a-entity id="sun" celestial-body="sun"><a-sphere segments-width="100" segments-height="100" color="yellow" material="side:double" radius="6957000000"></a-sphere></a-entity>
        
            <a-entity id="earth-in-solar-system" celestial-body="earth"></a-entity>
                                                                                                                                                        
            <a-entity id="moon" celestial-body="moon"><a-sphere segments-width="100" segments-height="100" color="white" material="side:double" radius="17370000"></a-sphere></a-entity>

        </a-entity>

    </a-scene>
        

<!--
sun: 695700000
mond: 1737000

cursor="rayOrigin: mouse" führt zu fehler... 

<a-circle id="andromeda-location" color="#ff0" radius="1" spherical-coords="longitude: 121.1743; latitude: -21.5733; radius: 100;" ></a-circle> 

<a-entity id="universeSphere" healpix-sphere="radius: 1000000000000000000; detail: 6" celestial-coordinate-transformation="from:equatorial;to:galactic"></a-entity>
    
<a-entity id="stars" celestial-particles="data:server/jsorrery/data/milkyway_heasarc_204k.json"></a-entity>

device-location-and-time="align-with-north: true;" 

<a-sphere color="red" material="side:double" radius="2000000" celestial-location="body: earth; latitude: 0; longitude: 0; altitude: 1; north: 0;">
<a-entity axis-helper="size:5000000"></a-entity>
</a-sphere>

<a-sphere color="cyan" material="side:double" radius="2000000" celestial-location="body: earth; latitude: 90; longitude: 0; altitude: 1; north: 0;">
<a-entity axis-helper="size:5000000"></a-entity>
</a-sphere>


<a-entity id="moon" celestial-body="moon"><a-sphere segments-width="100" segments-height="100" color="gray" radius="1737000"></a-sphere></a-entity>
        
copy-position="from: a-camera; attribute: position" 
celestial-coordinate-transformation="from:equatorial;to:galactic"
spherical-coords="latitude: 51.513587; longitude: 7.465298; radius: 6390000; north: 0;"

-->
    
`;


const setHips = (hips) => {
    const universeSphere = $('#universeSphere')[0];
    if (!universeSphere) {
        return;
    }
    universeSphere.setAttribute('healpix-sphere','urlpattern',hips.folder+'/512/#.jpg');
    universeSphere.setAttribute('celestial-coordinate-transformation','to',hips.properties.hips_frame);
}

const index2Table = (index) => {
    const table = $(`<a-entity>`);
    index.reverse().forEach((hips,i)=>{
        const iside = index.length/2;
        const tr = $(`
                <a-plane propagate="events:clickDown" class="clickable" width="2" height="2" opacity="0.0" 
                         spherical-coords="longitude: ${25*(Math.floor(i%iside)-iside/2)}; latitude: ${28*Math.floor(i/iside)}; radius: 6;" 
                         animation="property: scale; dir: normal; dur: 750; easing: easeOutElastic; loop: false; from: 1 1 1; to: 1.2 1.2 1.2; startEvents: click;">
                    
                    <a-entity transparent="true" group-opacity="0.0" animation="property: group-opacity; dir: normal; dur: 1500; easing: easeOutQuad; loop: false; from: 0.0; to: 1; delay: ${i*200+500};">
                  
                        <a-image src="${hips.folder}/512/4.jpg" width="2" height="2"></a-image>
                    
                        <a-text geometry="primitive: plane; height: 0.5; width: 2;" 
                                material="color: #202020; opacity: 0.2" 
                                width="4" position="0 -1.25 0" align="center" line-height="48" 
                                value="${hips.properties.obs_collection}\n${hips.properties.obs_regime}"></a-text>

                    </a-entity> 
    
                </a-plane>
       `);
        tr.click(()=>{
            AFRAME.log('clicked on '+hips.folder);
            setHips(hips);
        });
        table.append(tr);
    });
    return table;
}



$(()=> {
    $('body').html(html);

    $.getJSON('server/img/healpix/index.json',index=>{
        setHips(index[6]);
        const hudMenu = $('#hudMenu');
        // _.delay(()=>hudMenu.append(index2Table(index)),5000);
    });
});
