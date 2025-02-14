document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("heart"),
        ctx = canvas.getContext("2d"),
        width = canvas.width = window.innerWidth,
        height = canvas.height = window.innerHeight;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, width, height);
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    var rand = Math.random;

    function heartPosition(rad) {
        return [
            Math.pow(Math.sin(rad), 3),
            -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))
        ];
    }

    function scaleAndTranslate(pos, sx, sy, dx, dy) {
        return [dx + pos[0] * sx, dy + pos[1] * sy];
    }

    var traceCount = 50;
    var pointsOrigin = [];
    var i, dr = 0.1;
    for (i = 0; i < Math.PI * 2; i += dr) {
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210, 13, 0, 0));
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 150, 9, 0, 0));
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 90, 5, 0, 0));
    }
    var heartPointsCount = pointsOrigin.length;

    var targetPoints = [];
    function pulse(kx, ky) {
        for (i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [
                kx * pointsOrigin[i][0] + width / 2,
                ky * pointsOrigin[i][1] + height / 2
            ];
        }
    }

    var particles = [];
    for (i = 0; i < heartPointsCount; i++) {
        var x = rand() * width;
        var y = rand() * height;
        particles[i] = {
            vx: 0,
            vy: 0,
            R: 2,
            speed: rand() + 5,
            q: ~~(rand() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * rand() + 0.7,
            f: "hsla(0," + ~~(40 * rand() + 60) + "%," + ~~(60 * rand() + 20) + "%,.3)",
            trace: []
        };
        for (var k = 0; k < traceCount; k++) particles[i].trace[k] = { x: x, y: y };
    }

    var config = {
        traceK: 0.4,
        timeDelta: 0.01
    };

    var time = 0;
    function loop() {
        var n = -Math.cos(time);
        pulse((1 + n) * 0.5, (1 + n) * 0.5);
        time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta;

        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.fillRect(0, 0, width, height);

        for (i = particles.length; i--;) {
            var p = particles[i];
            var q = targetPoints[p.q];
            var dx = p.trace[0].x - q[0];
            var dy = p.trace[0].y - q[1];
            var length = Math.sqrt(dx * dx + dy * dy);

            if (length < 10) {
                if (rand() > 0.95) {
                    p.q = ~~(rand() * heartPointsCount);
                } else {
                    if (rand() > 0.99) p.D *= -1;
                    p.q += p.D;
                    p.q %= heartPointsCount;
                    if (p.q < 0) p.q += heartPointsCount;
                }
            }

            p.vx += -dx / length * p.speed;
            p.vy += -dy / length * p.speed;
            p.trace[0].x += p.vx;
            p.trace[0].y += p.vy;
            p.vx *= p.force;
            p.vy *= p.force;

            for (k = 0; k < p.trace.length - 1;) {
                var T = p.trace[k];
                var N = p.trace[++k];
                N.x -= config.traceK * (N.x - T.x);
                N.y -= config.traceK * (N.y - T.y);
            }

            ctx.fillStyle = p.f;
            for (k = 0; k < p.trace.length; k++) {
                ctx.fillRect(p.trace[k].x, p.trace[k].y, 1, 1);
            }
        }

        ctx.fillStyle = "rgba(255,255,255,1)";
        for (i = 0; i < targetPoints.length; i++) {
            ctx.fillRect(targetPoints[i][0], targetPoints[i][1], 2, 2);
        }

        window.requestAnimationFrame(loop);
    }
    loop();
});
