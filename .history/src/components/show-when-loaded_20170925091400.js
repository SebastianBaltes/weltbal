
AFRAME.registerComponent('show-when-loaded', {
    
        schema: { 
        },
    
        init() {
            const scene = document.querySelector('a-scene');
            scene.addEventListener('celestial-system-ready', ()=>{
                this.el.setAttribute("visible",true);
            });            
        },
    
    });
    