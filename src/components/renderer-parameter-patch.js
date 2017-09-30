let customRendererParameters = {};

THREE.WebGLRenderer = class extends THREE.WebGLRenderer {
    constructor(parameters) {
        parameters = Object.assign({}, parameters, customRendererParameters);
        console.log('WebGLRenderer('+JSON.stringify(parameters)+')');
        super(parameters);
    }
};

const booleanUndefined = {
    default: undefined,
    parse: value => null==value ? undefined : 'true'===value,
}

AFRAME.registerComponent('renderer-parameter-patch', {

    schema: {
        precision: {type: 'string', default: undefined},
        alpha: booleanUndefined,
        premultipliedAlpha : booleanUndefined,
        antialias: booleanUndefined,
        stencil: booleanUndefined,
        depth: booleanUndefined,
        logarithmicDepthBuffer: booleanUndefined,
    },

    init() {
        if (this.el.tagName.toLowerCase()=='a-scene') {
            console.error('renderer-parameter-patch has no effect on a-scene. Put it on another a-entity.');
        }
        const data = this.data;
        Object.keys(data)
            .filter(key=>data[key]!==undefined)
            .forEach(key=>customRendererParameters[key]=data[key]);
    },

});