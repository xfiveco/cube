var myCube = Cube('#robot-cube3a');

// Cube will start rotating only on one axis
myCube.rotate({
    startSide: 'side-3',
    speedX: 0,
    speedY: 20000, // 20 seconds to rotate by 360 degrees
    speedZ: 0
});