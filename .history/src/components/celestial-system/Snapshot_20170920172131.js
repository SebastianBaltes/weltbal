
export default class Snapshot {

    constructor() {
        this.time = 0;
        this.bodies = [];
    }

    interpolate(a,b,time) {
        this.time = time;

        const t = (this.time-a.time) / (b.time-a.time);
        this.bodies.forEach((body,i)=>{
            body.interpolate(a.bodies[i],b.bodies[i],t);
        });
        return this;
    }

    copy(other) {
        this.time = other.time;
        this.bodies = other.bodies.map(body=>new Body().copy(body));
    }

    fromJSON(json) {
        this.time = json.time;
        this.bodies = json.bodies.map(j=>new Body().fromJSON(j));
        return this;
    }

    getBody(name) {
        if (!(this.map)) {
            this.map = {};
            this.bodies.forEach(body=>this.map[body.name]=body);
        }
        return this.map[name];
    }

}