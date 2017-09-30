AFRAME.registerComponent('group-opacity', {
    
    schema: {
        type: 'number',
        default: 1.0
    },

    init() {
        this.storeOriginalOpacity(this.el);
        for (let child of this.el.children) {
            this.storeOriginalOpacity(child);
        }
    },

    update() {
        this.setOpacity(this.el);
        for (let child of this.el.children) {
            this.setOpacity(child);
        }
    },

    setOpacity(object) {
        const originalOpacity = object.__originalOpacity==null? 1 : object.__originalOpacity;
        let opacity = this.data * originalOpacity;
        object.setAttribute('transparent', 'true');
        object.setAttribute('material', 'transparent', 'true');
        object.setAttribute('material', 'opacity', opacity);
        object.setAttribute('opacity', opacity);
    },

    storeOriginalOpacity(object) {
        let o = object.getAttribute('opacity');
        if (o!=null) {
            o = object.getAttribute('material', 'opacity');
        }
        object.__originalOpacity = o==null ? null : parseFloat(o);
    },

});