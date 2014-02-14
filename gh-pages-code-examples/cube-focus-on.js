var myCube = Cube('#robot-cube4');

// Cube will spin to the selected side
// and back to the previous position
myCube.focusOn({
	bounceBack: true,
	spinTo: 'side-5'
});