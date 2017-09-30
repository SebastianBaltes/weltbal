export default class Body {
    
    constructor(json) {
        this.name = json.name;
        this.position = Vector3.fromJSON(json.position);
        this.quaternion = Quaternion.fromJSON(json.quaternion);
        this.currentRotation = json.currentRotation;
        this.tilt = Euler.fromJSON(json.tilt);
    }

}