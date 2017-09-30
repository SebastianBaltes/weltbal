
AFRAME.registerComponent('remove', {
    
    schema: { 
        when: { type: "string" },
        delay: { type: "number" },
    },

    init() {
        const data = this.data;
        this.el.addEventListener(data.when, ()=>{
            const remove = ()=>this.el.parentElement.removeChild(this.el);
            if (data.delay>0) {
                setTimeout(remove,data.delay);                    
            } else {
                remove();
            }
        });            
    },

});
