
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
                    // this.el.emit(data.event,event.detail,false);
                    const eventName = data.as.length>0 ? data.as : data.event;
                    console.log('emit',eventName,'on',this.el);
                },data.delay));
    },

});
