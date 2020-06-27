var ctx = document.querySelector('canvas').getContext('2d');
var width = 1000;
var height = 600;
var bobs = [
    { x: 0, y: 0, ang: 0, m: 3, r: 5, l: 2.5, dots: [], maxd: 600, color: '#000000' },
    { x: 0, y: 0, ang: 0, m: 1, r: 5, l: 2.0, dots: [], maxd: 500, color: '#00FF00' }
];
var esc = 100; // escala de 'metros' a pixeles
var alpha = bobs[1].m / bobs[0].m;
var beta = bobs[1].l / bobs[0].l;
var gamma = 9.8 / bobs[0].l;

function move(angles) {
    bobs.forEach(function (bob, i, a) {
        bob.ang = angles[i];
        bob.x = bob.l * Math.sin(bob.ang);
        bob.y = bob.l * Math.cos(bob.ang);
        if (i == 1) {
            bob.x += a[0].x;
            bob.y += a[0].y;
        }
        bob.dots.push([bob.x, bob.y]);
        if (bob.dots.length > bob.maxd) bob.dots.shift();
    });
}

function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = 'white';
    ctx.moveTo(width / 2, height / 6);
    bobs.forEach(function (bob) {
        ctx.lineTo(esc * bob.x + width / 2, esc * bob.y + height / 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.arc(esc * bob.x + width / 2, esc * bob.y + height / 6, bob.r, 0, 2 * Math.PI);
        ctx.fill();
        bob.dots.forEach(function (p, i, a) {
            ctx.fillStyle = tenue(bob.color, i, a.length);
            ctx.beginPath();
            ctx.arc(esc * p[0] + width / 2, esc * p[1] + height / 6, 0.5, 0, 7);
            ctx.fill();
        });
    });
}

function tenue(color, i, n) {
    var r = parseInt(color.substring(1, 3), 16) * i / n;
    var g = parseInt(color.substring(3, 5), 16) * i / n;
    var b = parseInt(color.substring(5), 16) * i / n;
    return "rgb(" + r + " ," + g + " ," + b + ")";
}

// Algoritmo Runge-Kutta
function rkNext(initPoint, derivatives, h) {
    var nextPoint = initPoint.slice(0);
    var evalAt = initPoint.map(function () { return 0; });
    var ks = initPoint.map(function () { return 0; });
    var coefs = [0, 1 / 2, 1 / 2, 1];
    var fracs = [1 / 6, 1 / 3, 1 / 3, 1 / 6];

    for (var n = 0; n < 4; n++) {
        evalAt.forEach(function (v, i, a) { a[i] = initPoint[i] + coefs[n] * ks[i] * h; });
        ks.forEach(function (k, i, a) { a[i] = derivatives.apply(null, [i].concat(evalAt)); });
        nextPoint.forEach(function (y, i, a) { a[i] = y + fracs[n] * ks[i] * h; });
    }
    return nextPoint;
}

function derivatives(i, t, ang1, ang2, w1, w2) {
    switch (i) {
        case 0: return 1;
        case 1: return w1;
        case 2: return w2;

        case 3: return - ((1 + alpha) * gamma * Math.sin(ang1) + alpha * beta * Math.pow(w2, 2) * Math.sin(ang1 - ang2) + alpha * Math.cos(ang1 - ang2) * (Math.pow(w1, 2) * Math.sin(ang1 - ang2) - gamma * Math.sin(ang2))) / (1 + alpha * Math.pow(Math.sin(ang1 - ang2), 2));

        case 4: return ((1 + alpha) * (Math.pow(w1, 2) * Math.sin(ang1 - ang2) - gamma * Math.sin(ang2)) + Math.cos(ang1 - ang2) * ((1 + alpha) * gamma * Math.sin(ang1) + alpha * beta * Math.pow(w2, 2) * Math.sin(ang1 - ang2))) / beta / (1 + alpha * Math.pow(Math.sin(ang1 - ang2), 2));
    }
}

var currPos = [0, Math.PI / 2, Math.PI / 2, 0, 0];

setInterval(function () {
    move(currPos.slice(1, 3)); // solo ocupa ang1 y ang2, no necesita w1 ni w2 ni t
    draw();
    currPos = rkNext(currPos, derivatives, 0.02);
}, 20);
