import LLSpherical from "../commons/LLSpherical";

/**
 * Crawling Cursor component for A-Frame.
 */
AFRAME.registerComponent('cursor-sphere-coordinates', {
    dependencies: ['raycaster'],

    init: function () {
        const el = this.el;
        const data = this.data;

        const camera = document.querySelector('#camera').object3D;

        // this.el.sceneEl.addEventListener("raycaster-intersection", e => {
        //     if (e.detail.intersections.length==0) {
        //         return;
        //     }
        //     const intersection = e.detail.intersections[0];
        //     const point = intersection.point;
        //     const direction = point.clone().sub(camera.getWorldPosition());
        //     const s = new LLSpherical().fromVector3(direction);
        //     this.el.object3D.position = intersection.point;
        //
        //     el.setAttribute('value', (s.longitude/360*24).toFixed(2)+'h, '+s.latitude.toFixed(2)+"'");
        // });
    }
});