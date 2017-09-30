
AFRAME.registerComponent('device-location-and-time', {
    dependencies: ['celestial-system'],
    schema: {
        alignWithNorth: { type:'boolean', default: true }
    },
    init() {
        const data = this.data;

        const setAttribute = (properties) => {
            const merged = Object.assign({},properties,this.el.getAttribute('celestial-system'));
            this.el.setAttribute('celestial-system',merged);
        }

        setAttribute({time:Date.now()});

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(position => {

                if (position.coords) {
                    setAttribute({
                        longitude: position.coords.longitude || 0,
                        latitude: position.coords.latitude || 0,
                        altitude: position.coords.altitude || 0,
                    });
                }

                if (position.webkitCompassHeading!=null) {
                    setAttribute({
                        north: position.webkitCompassHeading || 0,
                    });
                }

            });
            if ('ondeviceorientationabsolute' in window) {
                function listener(orientation) {
                    window.removeEventListener('deviceorientationabsolute',listener);
                    setAttribute({
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
