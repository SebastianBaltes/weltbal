
AFRAME.registerComponent('when-loaded', {
    
        schema: { type: "string" },
    
        init() {
            const order = this.data;
            const scene = document.querySelector('a-scene');
            scene.addEventListener('celestial-system-ready', ()=>{
                switch (order) {
                    case "show": 
                        this.el.setAttribute("visible",true);
                        break;
                    case "active": 
                        this.el.setAttribute("active",true);
                        break;
                    case "remove": 
                        this.el.object3D.parent.remove(this.el.object3D);
                        break;
                }
            });            
        },
    
    });
    