import Body from './Body';

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
        return this;
    }

    fromJSON(json) {
        this.time = json.time;
        this.bodies = json.bodies.map(j=>new Body().fromJSON(j));
        return this;
    }

    getBody(name) {
        if (!(this.map)) {
            this.map = {};
        }
        let body = this.map[name];
        if (body===undefined) {
            body = this.bodies.find(b=>b.name===name);
            this.map[name] = body;                
        }
        return body;
    }

}