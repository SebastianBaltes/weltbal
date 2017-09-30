AFRAME.registerComponent('copy-position', {
    schema: {
        from: {type: 'selector'},
        world: {type: 'boolean'},
        normalize: {type: 'boolean'},
        attribute: {type: 'string'},
    },
    init() {
        const data = this.data;
        this.attributeSplit = data.attribute.split('.');
        this.oldPosition = null;
    },
    tick() {
        const position = this.getPosition();
        if (this.oldPosition==null || !(this.oldPosition.equals(position))) {

            if (this.attributeSplit.length==2) {
                this.el.setAttribute(this.attributeSplit[0], this.attributeSplit[1], position);
            } else {
                this.el.setAttribute(this.attributeSplit[0], position);
            }

            this.oldPosition==position;
        }
    },
    getPosition() {
        const data = this.data;
        const object = data.from.object3D;
        const position = (data.world ? object.getWorldPosition() : object.position).clone();
        return data.normalize ? position.normalize() : position;
    }
});