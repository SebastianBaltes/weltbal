AFRAME.registerComponent('device-location-and-time', {
    schema: {
        alignWithNorth: { type:'boolean', default: true }
    },
    init() {
        const data = this.data;
        const entity = this.el;

        const store = entity.store = {
            time: new Date(),
            latitude: 0,
            longitude: 0,
            altitude: 0,
            north: 0,
            lastNorth: 0,
        };

        entity.addEventListener('geolocation', () => {
            if (data.alignWithNorth) {
                const northDelta = store.lastNorth - store.north;
                entity.object3D.rotateY(northDelta*Math.PI/180);
                store.lastNorth = store.north;
            }
        });

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {

                if (position.coords) {
                    store.longitude = position.coords.longitude || 0;
                    store.latitude = position.coords.latitude || 0;
                    store.altitude = position.coords.altitude || 0;
                }

                if (position.webkitCompassHeading!=null) {
                    store.north = position.webkitCompassHeading;
                }
                entity.emit('geolocation', null, true);

            });
            if ('ondeviceorientationabsolute' in window) {
                function listener(orientation) {
                    window.removeEventListener('deviceorientationabsolute',listener);
                    store.north = orientation.alpha || 0;
                    entity.emit('geolocation', null, true);
                }
                window.addEventListener('deviceorientationabsolute',listener);
            }

        } else {

            console.warn('geolocation is not available');

        }
    },
});
