import CoordinateParser from '../commons/CoordinateParser';
import {injectCelestialSystem} from './celestial-system';

AFRAME.registerComponent('celestial-location', {

    schema: {
        body: { type: 'string', default: 'earth' }, 
        latitude: { type: 'number', default: 0 },
        longitude: { type: 'number', default: 0 },
        altitude: { type: 'number', default: 0 },
        north: { type: 'number', default: 0 },
    },

    init()  {
        injectCelestialSystem(this);
    },

    tick() {
        if (this.celestialSystem) {
            const data = this.data;
            const name = this.data.body;
            const body = this.celestialSystem.getBody(name);
            const object = this.el.object3D;
            body.applyLocationOnBodyTransformation(object,
                CoordinateParser.parse(data.longitude),
                CoordinateParser.parse(data.latitude),
                data.altitude,
                CoordinateParser.parse(data.north));
        }
    },

});
