
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
                ()=>{
                    // this.el.emit(data.event,event.detail,false);
                    this.el.dispatchEvent(new Event(data.event, {detail: event.detail, bubbles: false}));
                    console.log('emit',data.event,'on',this.el);
                },data.delay));
    },

});
