
AFRAME.registerComponent('device-location-and-time', {
    schema: {
        alignWithNorth: { type:'boolean', default: true }
    },
    init() {
        const data = this.data;
        const entity = this.el;

        entity.setAttribute('celestial-system','time',new Date());

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {

                if (position.coords) {
                    entity.setAttribute('celestial-system',{
                        longitude: position.coords.longitude || 0,
                        latitude: position.coords.latitude || 0,
                        altitude: position.coords.altitude || 0,
                    });
                }

                if (position.webkitCompassHeading!=null) {
                    const north = position.webkitCompassHeading || 0;
                    entity.setAttribute('celestial-system',{
                        north: position.webkitCompassHeading || 0,
                    });
                }

                entity.emit('geolocation', null, true);

            });
            if ('ondeviceorientationabsolute' in window) {
                function listener(orientation) {
                    window.removeEventListener('deviceorientationabsolute',listener);
                    entity.setAttribute('celestial-system',{
                        north: orientation.alpha || 0,
                    });
                }
                window.addEventListener('deviceorientationabsolute',listener);
            }

        } else {

            console.warn('geolocation is not available');

        }
    },


});
