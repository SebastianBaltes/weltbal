import {getRotationFromAToB} from '../commons/Utils';
import {Quaternion,ector3,Math,Matrix4} from 'three';

AFRAME.registerComponent('move-me-so-that', {
    schema: {
        my: {type: 'selector'},
        isAt: {type: 'selector'},
    },
    tick() {
        const data = this.data;
        const me = this.el.object3D;
        const myChild = data.my.object3D;
        const target = data.isAt.object3D;

		const m2 = new Matrix4();
        const m1 = new Matrix4();

        m2.multiply(myChild.matrix);
        
/*
        m2.multiply(myChild.matrix);
		m2.multiply(target.matrix);

		m2.multiply(m1.getInverse(myChild.matrix, true));
		m2.multiply(m1.getInverse(target.matrix, true));
*/
		me.matrix.identity();
		me.applyMatrix(m2);
        me.updateMatrixWorld();
    },
});
