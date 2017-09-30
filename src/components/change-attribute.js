
AFRAME.registerComponent('change-attribute', {
    
    schema: { 
        attribute: { type: "string" },
        value: { type: "string" },
        when: { type: "string" },
        delay: { type: "number" },
    },

    init() {
        const data = this.data;
        this.el.addEventListener(data.when, ()=>{
            setTimeout(()=>
                this.el.setAttribute(data.attribute,data.value)
            ,data.delay);                    
        });            
    },

});
