var myCube = Cube('#robot-cube4c');

// Start rotating
myCube.rotate({
    startSide: 'side-3',
    speedX: 0,  // 5 seconds to rotate by 360 degrees
    speedY: 10000, // 20 seconds to rotate by 360 degrees
    speedZ: 10000,  // 10 seconds to rotate by 360 degrees
    rotateDir: 'left'
});


// Cube will spin to the selected side
// and back to the previous position
myCube.focusOn({
	bounceBack: true,
	spinTo: 'side-1'
});