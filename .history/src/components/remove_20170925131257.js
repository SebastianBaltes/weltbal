
AFRAME.registerComponent('remove', {
    
    schema: { 
        when: { type: "string" },
        delay: { type: "number" },
    },

    init() {
        const data = this.data;
        tbus.el.addEventListener(data.when, ()=>{
            const remove = ()=>this.el.object3D.parent.remove(this.el.object3D);
            if (data.delay>0) {
                setTimeout(remove,data.delay);                    
            } else {
                remove();
            }
        });            
    },

});
