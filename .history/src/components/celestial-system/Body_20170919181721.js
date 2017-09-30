export default class Body {

    constructor() {
        this.name = null;
        this.position = new Vector3();
        this.quaternion = new Vector3();
        this.tilt = new Vector3();
        this.rotation = 0;
        this.movement = new Vector3();;
    }

    interpolate(a,b,t,dt) {
        this.position.lerpVectors(a.position,b.position,t);
        this.quaternion.copy(a.quaternion).slerp(b.quaternion,t);
        this.tilt.copy(a.tilt).slerp(b.tilt,t);
        this.rotation = a.rotation * (1-t) + b.rotation * t;
        if (deltaT==0) {
            this.movement.set(0,0,0);
        }  else {
            this.movement.copy(b.position).sub(a.position).multiplyScalar(1/dt);
        }
        return this;
    }

    copy(c) {
        this.name = c.name;
        this.position.copy(c.position);
        this.quaternion.copy(c.quaternion);
        this.tilt.copy(c.tilt);
        this.rotation = c.rotation;
        this.movement.copy(c.movement);
        return this;
    }

    fromJSON(json) {
        this.name = json.name;
        this.position.fromJSON(json.position);
        this.quaternion.fromJSON(json.quaternion);
        this.tilt.fromJSON(json.tilt);
        this.rotation = json.rotation;
        this.movement.copy(0,0,0);
        return this;
    }

}