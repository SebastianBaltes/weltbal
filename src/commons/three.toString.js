import { Vector3, Box3, Vector2, Box2, Sphere, Ray, Plane, Quaternion, Matrix4, Color, Spherical, Euler } from 'three';

Vector3.prototype.toString = function() {
    try {
        return '('+this.x.toFixed(3)+','+this.y.toFixed(3)+','+this.z.toFixed(3)+')';
    } catch (e) {
        return '('+this.x+','+this.y+','+this.z+')';
    }
};
Box3.prototype.toString = function() {
    return '('+this.min+','+this.max+')';
};
Vector2.prototype.toString = function() {
    try {
        return '('+this.x.toFixed(3)+','+this.y.toFixed(3)+')';
    } catch (e) {
        return '('+this.x+','+this.y+')';
    }
};
Box2.prototype.toString = function() {
    return '('+this.min+','+this.max+')';
};
Sphere.prototype.toString = function() {
    return '(c:'+this.center+',r:'+this.radius+')';
};
Ray.prototype.toString = function() {
    return '(o:'+this.origin+',d:'+this.direction+')';
};
Plane.prototype.toString = function() {
    return '(o:'+this.constant+',normal:'+this.normal+')';
};
Quaternion.prototype.toString = function() {
    return '('+this._x+','+this._y+','+this._z+','+this._w+')';
};
Matrix4.prototype.toString = function() {
    try {
        var el = this.elements;
        var e = (i) => el[i].toFixed(2) + ' ';
        return  '\n+ ' + e(0) + e(4) + e(8)  + e(12) + ' +\n' +
            '| ' + e(1) + e(5) + e(9)  + e(13) + ' |\n' +
            '| ' + e(2) + e(6) + e(10) + e(14) + ' |\n' +
            '+ ' + e(3) + e(7) + e(11) + e(15) + ' +\n';
    } catch (e) {
        return JSON.stringify(this);
    }
};
Color.prototype.toString = function() {
    return '#'+this.getHexString();
};
Spherical.prototype.toString = function() {
    try {
        return '('+this.radius.toFixed(3)+','+this.phi.toFixed(3)+','+this.theta.toFixed(3)+')';
    } catch (e) {
        return '('+this.radius+','+this.phi+','+this.theta+')';
    }
};