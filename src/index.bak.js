import "./style/index.scss";
import "aframe";
import "./patch/three.toString";
import "./components/spherical-coords";
import "./components/spherical-grid";
import "./components/copy-position";
import "./components/healpix-sphere";
import "./components/renderer-parameter-patch";
import "./components/celestial-coordinate-transformation";
import "./components/device-location-and-time";
import './components/life-html-texture';
import './components/spherical-rotation';
import "aframe-sun-sky";
import "aframe-environment-component";
import "aframe-log-component";


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
    <a-scene antialias="true" cursor="rayOrigin: mouse">

        <a-assets>
            <a-mixin id="CardinalCoordsSchema" text="align: center; width: 100; color: red; transparent: true; opacity: 0.2;" spherical-coords="latitude: 5; radius: 100;"></a-mixin>
             <a-mixin id="overlay-fade-in" animation="property: opacity; dir: normal; dur: 500; easing: easeOutQuad; loop: false; from:0; to: .75; startEvents: clickDown;"></a-mixin>
        </a-assets>

        <a-camera near="0.1" far="100000000000000000" renderer-parameter-patch="logarithmicDepthBuffer: false">
<!--            <a-cursor></a-cursor> -->
        </a-camera>

        <a-entity laser-controls line="color: yellow; opacity: 0.75"></a-entity>

        <a-entity id="controls" copy-position="from: a-camera; attribute: position">

            <a-entity spherical-rotation="longitude: 0; latitude: 0;">
               <a-entity id="hudMenu">
               </a-entity>
            
<!--
                ${coordinateGrid({longitudeUnit:'°',color:'#0ff'})}

                <a-entity spherical-rotation="longitude: 0; latitude: -20;" position="0 -0.5 0">
                    <a-curvedimage life-html-texture="source: #hudContainer; width: 2048; height: 1024;" height="3.0" radius="2" theta-start="150" theta-length="60" scale="-1 1 1"></a-curvedimage>
                </a-entity>
-->
    
                <a-entity spherical-rotation="longitude: 0; latitude: 0;">
                    <a-entity log geometry="primitive: plane"></a-entity>
                </a-entity>

    <!--
                <a-text value="0, 0" cursor-sphere-coordinates spherical-coords="longitude: 0; latitude: 0; radius: 10;" align="center" width="10" color="green" transparent=true"></a-text>
    -->

            </a-entity> 

        </a-entity>        

        <a-entity id="horizontalFrame" device-location-and-time="alignWithNorth:true;">

<!--
            <a-entity environment="preset: default;" copy-position="from: #sun; world: true; normalize: true; attribute: environment.lightPosition"></a-entity>
            <a-circle id="sun" color="#ff0" radius="5" spherical-coords="latitude: 20; longitude: 20; radius: 1000"></a-circle>
-->

            <a-entity id="equatorialFrame" copy-position="from: a-camera; attribute: position">

                <a-entity id="universeSphere" healpix-sphere="radius: 10000000; detail: 0"></a-entity>
    
                <a-entity id="CardinalDirections">
                    <a-text value="N" spherical-coords="longitude: 0;" mixin="CardinalCoordsSchema"></a-text>
                    <a-text value="E" spherical-coords="longitude: 90;" mixin="CardinalCoordsSchema"></a-text>
                    <a-text value="S" spherical-coords="longitude: 180;" mixin="CardinalCoordsSchema"></a-text>
                    <a-text value="W" spherical-coords="longitude: 270;" mixin="CardinalCoordsSchema"></a-text>
                </a-entity>
   
   <!-- 
                <a-circle color="#f00" radius="2" spherical-coords="longitude: 10.68468065; latitude: 41.26869767; radius: 101;" ></a-circle>
    -->
    
                ${coordinateGrid({longitudeUnit:'°',color:'#0ff'})}
   
                <a-entity id="galacticFrame" celestial-coordinate-transformation="from:equatorial;to:galactic">
    
                    ${coordinateGrid({longitudeUnit:'°'})}

                    <a-circle color="#ff0" radius="1" spherical-coords="longitude: 121.1743; latitude: -21.5733; radius: 100;" ></a-circle>
       
                </a-entity>
    
            </a-entity>

        </a-entity>

        <!-- cardinal directions -->

    </a-scene>
    
    <div id="hudContainer" style="display:none;">
        <div id="hudContent" style="background: rgba(30,30,30,0.3); color: white; font-size: 32px; padding: 0.2em; border: 1px solid #666; border-radius: 0.2em;">
            Hello World!!!!!
        </div>    
    </div>

    <div id="loading" style="position:absolute;width:100%;height:100%;background-color:black;top:0;left:0;">
    </div>

    <script>
        document.querySelector('a-scene').addEventListener('loaded', ()=>{
            document.querySelector('#loading').style.zIndex=-1;
        });
    </script>
`;

const setHips = (hips) => {
    const universeSphere = $('#universeSphere')[0];
    universeSphere.setAttribute('healpix-sphere','urlpattern',hips.folder+'/512/#.jpg');

    const rotation = (hips.properties.hips_frame=='galactic') ? $('#galacticFrame')[0].object3D.quaternion : new THREE.Quaternion(0,0,0,1);
    universeSphere.object3D.quaternion.copy(rotation);
}

const index2Table = (index) => {
    const table = $(`<a-frame>`);
    index.forEach((hips,i)=>{
        const tr = $(`
            <a-plane propagate="events:clickDown" class="clickable" width="4" height="3" opacity="0"
                     spherical-coords="longitude: 0; latitude: ${5*(i-index.length/2)}; radius: 20;"
                     animation="property: scale; dir: normal; dur: 750; easing: easeOutElastic; loop: false; from: 1 1 1; to: 1.5 1.5 1.5; startEvents: click;"> 

                <a-image 
                  src="${hips.folder}/512/4.jpg" 
                  width="2"
                  height="2"
                  opacity="0"
                  animation="property: opacity; dir: normal; dur: 1500; easing: easeOutQuad; loop: false; from:0; to: 1; delay: 1250;"></a-image>
                
                <a-plane idwidth="4" height="3" position="0 0 0.01" color="#000" opacity="0" mixin="overlay-fade-in"></a-plane>
                
                <a-text position="0 1 0.2" align="center" line-height="64" opacity="0" value="${hips.properties.obs_collection}\n${hips.properties.hips_frame} ${hips.properties.obs_regime}" mixin="overlay-fade-in"></a-text>
                
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
        hudMenu.empty();
        hudMenu.append(index2Table(index));
        hudMenu[0].dispatchEvent(new Event('update', {bubbles: true}));
        setTimeout(()=>{
            const hips = index[3];
            setHips(hips);
        },5000);
    });
});
