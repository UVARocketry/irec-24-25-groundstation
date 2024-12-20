class Quaternion {
    /** @type {number}*/
    w = 0;
    /** @type {number}*/
    x = 0;
    /** @type {number}*/
    y = 0;
    /** @type {number}*/
    z = 0;
}

//The rotation quaternion, set in the draw function
var q1 = { w: 0, x: 0, y: 0, z: 0 };
//Multiply 2 quaternions
/**
 * @param q1 {Quaternion}
 * @param q2 {Quaternion}
 */
function quatmult(q1, q2) {
    var a = q1.w;
    var b = q1.x;
    var c = q1.y;
    var d = q1.z;
    var e = q2.w;
    var f = q2.x;
    var g = q2.y;
    var h = q2.z;

    return {
        w: a * e - b * f - c * g - d * h,
        x: a * f + b * e + c * h - d * g,
        y: a * g - b * h + c * e + d * f,
        z: a * h + b * g - c * f + d * e,
    };
}
//Convert a quaternion to a string
/**
 * @param q {Quaternion}
 */
function quattoString(q) {
    return "w: " + q.w + ", \nx: " + q.x + ",\ny: " + q.y + ",\nz: " + q.z;
}
//Get the conjugate of a quaternion
/**
 * @param q {Quaternion}
 */
function quatconj(q) {
    return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}
//Get the norm of a quaternion
/**
 * @param q {Quaternion}
 */
function quatnorm(q) {
    return Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
}
//Normalize a quaternion
/**
 * @param q {Quaternion}
 */
function quatnormalize(q) {
    var n = quatnorm(q);
    q.w /= n;
    q.y /= n;
    q.x /= n;
    q.z /= n;
}
//Get the inverse of a quaternion
/**
 * @param q {Quaternion}
 */
function quatinverse(q) {
    var c = quatconj(q);
    var qn = Math.pow(quatnorm(q), 2);
    c.w /= qn;
    c.x /= qn;
    c.y /= qn;
    c.z /= qn;
    return c;
}
