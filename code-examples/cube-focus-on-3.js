var myCube = Cube('#the-cube4b');

// Cube will spin to the selected side
// and back to the previous position
myCube.focusOn({
	bounceBack: true,
	spinToX: 33,
	spinToY: 88,
	spinToZ: 289
});