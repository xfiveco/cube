var myCube = Cube('#robot-cube3');

// Cube will start rotating
myCube.rotate({
    startSide: 'side-3',
    speedX: 5000,  // 5 seconds to rotate by 360 degrees
    speedY: 20000, // 20 seconds to rotate by 360 degrees
    speedZ: 10000  // 10 seconds to rotate by 360 degrees
});