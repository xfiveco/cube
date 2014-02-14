var myCube = Cube('#robot-cube3b');

// Cube will start rotating only on one axis
// to the left
myCube.rotate({
    startSide: 'side-3',
    speedX: 0,
    speedY: 10000, // 10 seconds to rotate by 360 degrees
    speedZ: 0,
    rotateDir: 'left'
});