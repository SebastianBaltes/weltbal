
AFRAME.registerComponent('foreward', {

    schema: { 
        from: { type: "selector" },
        event: { type: "string" },
        delay: { type: "number" },
        as: { type: "string" },
    },

    init() {
        const data = this.data;
        data.from.addEventListener(data.event, 
            event => setTimeout(
                ()=>{
                    const eventName = data.as.length>0 ? data.as : data.event;
                    this.el.emit(eventName,event.detail,false);
                },data.delay));
    },

});
