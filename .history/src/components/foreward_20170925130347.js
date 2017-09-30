import _ from 'lodash';

AFRAME.registerComponent('foreward', {

    schema: { 
        from: { type: "selector" },
        event: { type: "string" },
    },

    init() {
        const order = this.data;
        const me = this.el;
        data.from.addEventListener(data.event, function (event) {
            const eventClone = _.defaultsDeep({ bubbles: false },event);
            me.dispatchEvent(eventClone);
        });            
    },

});
