import LLSpherical from "../commons/LLSpherical";

AFRAME.registerComponent('spherical-grid', {

    schema: {
        radius: {type: 'number', default: 1},
        direction: {type: 'string', default: 'longitude'},
        from: {type: 'number', default: 0},
        to: {type: 'number', default: 360},
        step: {type: 'number', default: 1},
        color: {type: 'color', default: '#f00'},
        segments: {type: 'number', default: 64},
        opacity: {type: 'number', default: 1},
    },

    update() {
        const data = this.data;
        // console.log('schema ',JSON.stringify(data));
        const object = this.el.object3D;

        // Remove center vertex
        const lineMaterial = new THREE.LineBasicMaterial( { color: new THREE.Color(data.color), linewidth: 0.1, transparent: data.opacity<1, opacity: data.opacity } );

        const s = LLSpherical.create(0,0,data.radius);

        for (let value=data.from;value<=data.to;value+=data.step) {
            s[data.direction]=value;
            const v = s.toVector3()

            const radius = data.direction=='longitude' ? data.radius : v.z;
            const lineGeometry = new THREE.CircleGeometry( radius, data.segments );
            lineGeometry.vertices.shift();
            const circle = new THREE.Line( lineGeometry, lineMaterial );
            // circle.rotateY(s.theta);
            if (data.direction=='longitude') {

                // TODO BÖSE!!! ???

                circle.rotateY(THREE.Math.degToRad(18*360/24)).rotateY(s.theta);
            } else {
                circle.rotateX(THREE.Math.degToRad(90));
                circle.position.y = v.y;
            }

            object.add( circle );
        }
    },

});
