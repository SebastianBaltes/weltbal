
AFRAME.registerComponent('foreward', {

    schema: { 
        from: { type: "selector" },
        event: { type: "string" },
        delay: { type: "number" },
    },

    init() {
        const data = this.data;
        data.from.addEventListener(data.event, 
            event => setTimeout(
                ()=>this.el.emit(data.event,null,false),data.delay));
    },

});
