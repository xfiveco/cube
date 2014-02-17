// Allows to manipulate the cube created using CSS and HTML.
// 
// author:  Artur Kot (artur.kot@xhtmlized.com)

/*jshint browser: true, smarttabs: false, indent: 4, undef: true, unused: true, strict: true, trailing: true, onevar: true, white: true */
/*globals requestAnimationFrame, cancelAnimationFrame*/

(function () {
    'use strict';

    var Test, Cube;

    // ## Tests
    Test = {
        // ### 'requestAnimationFrame' test
        // Checks if 'requestAnimationFrame' is available
        // 
        // * return: __boolean__ Returns true if 'requestAnimationFrame' is available.
        animationFrame: function () {
            return !!window.requestAnimationFrame;
        },

        // ### CSS 3d test
        // Checks if CSS 3d transforms can be used
        // 
        // * return: __boolean__ Returns true if 'requestAnimationFrame' is available.
        css3d: function () {
            if (document.querySelector === undefined) { return false; }

            var EL_ID = 'temporaryCubeCSS3dElement',
                STYLE_ID = 'temporaryCubeCSS3dStyle',
                $body = document.body,
                $el,
                $style,
                docStyles = document.documentElement.style,
                prefixes = ['webkit', 'moz', 'ms', ''],
                testResult,
                i,
                j;

            // * #### Test for 'preserve3d' CSS property.
            //   - return: __boolean__ Returns true if 'preserve3d' is available.
            function testPreserve3d() {
                for (i = 0, j = prefixes.length; i < j; i += 1) {
                    if (prefixes[i].length > 0) {
                        if (docStyles[prefixes[i] + 'TransformStyle'] !== undefined) {
                            docStyles[prefixes[i] + 'TransformStyle'] = 'preserve-3d';
                            if (docStyles[prefixes[i] + 'TransformStyle'].length > 0) {
                                docStyles[prefixes[i] + 'TransformStyle'] = '';
                                return true;
                            }
                        }
                    } else {
                        if (docStyles.transformStyle !== undefined) {
                            docStyles.transformStyle = 'preserve-3d';
                            if (docStyles.transformStyle.length > 0) {
                                docStyles.transformStyle = '';
                                return true;
                            }
                        }
                    }
                }

                return false;
            }

            testResult = testPreserve3d();

            // * **Note:**
            //   This is additional test checking if 'transform-3d' is **really available**.
            //   It may happen that although property itself is available it's not working properly.
            //   One of possible reasons can be lack of GPU support.
            //   The additional CSS 3d transform test is borrowed from [Modernizr](https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/transforms3d.js)
            if (testResult && docStyles.webkitPerspective !== undefined) {
                $style = document.createElement('style');
                $el = document.createElement('div');

                $style.id = STYLE_ID;
                $el.id = EL_ID;

                $body.appendChild($style);
                $body.appendChild($el);

                $style.textContent = [
                    '@media (transform-3d), (-webkit-transform-3d) {',
                    '    #' + EL_ID + '{',
                    '       left: 9px;',
                    '       position: absolute;',
                    '       height: 5px;',
                    '       margin: 0;',
                    '       padding: 0;',
                    '       border: 0',
                    '   }',
                    '}'
                ].join('\n');

                testResult = $el.offsetLeft === 9 && $el.offsetHeight === 5;

                $body.removeChild($style);
                $body.removeChild($el);
            }

            return testResult;
        }
    };

    // ## CSS class
    // Adds class at the top of the document. 
    // Useful for applying fallback if Cube cannot be fired.
    if (Test.animationFrame() && Test.css3d()) {
        document.documentElement.className += ' cube-3d-available';
    }

    // ## Factory function
    // Allows to create new Cube instance in the following fashion
    // (note that 'new' is not necessary as it's added inside
    // the function below):
    // ```
    // var myCube = Cube('.my .selector');
    // ```
    // and later use any of the available public classes, e.g.:
    // ```
    // myCube.rotate();
    // ```
    // The function is revealed using `window` object.
    // 
    // * parameters:
    //     - `selector` __string__                  Any CSS selector that will work with [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/document.querySelector).
    //     - `props`    __object__                  The cube's options passed to the constructor.
    // * return         __function__  or __object__ If the cube can be fired `Cube` will return new instance of `Cube.instance` constructor else it will return object with empty methods.
    Cube = function (selector, props) {
        if (Test.animationFrame() && Test.css3d()) {
            return new Cube.instance(selector, props || {});
        }

        return {
            applyRotation: function () { return false; },
            rotate: function () { return false; },
            focusOn: function () { return false; },
            spinTo: function () { return false; }
        };
    };

    window.Cube = Cube;

    // ## Constructor
    // * parameters:
    //     - `selector` __string__ Any CSS selector that will work with [querySelector](https://developer.mozilla.org/en-US/docs/Web/API/document.querySelector).
    //     - `props`    __object__ The cube's options.
    Cube.instance = function (selector, props) {
        // The only option that can be currently passed to the constructor
        // is [perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective).
        props.perspective = props.perspective || 1100;

        // ### Public variables

        // * `$cube`          __object__  A DOM element which is supposed to be a cube.
        this.$cube = document.querySelector(selector || '#the-cube');

        // * `props`          __object__  Options publicly available for methods.
        this.props = props;

        // * `rotatePropsSet` __boolean__ True if rotate properties (posX, posY, posZ, speedX, speedY, speedZ) has been set. See `rotate` method below.
        this.rotatePropsSet = false;

        // * `rotateDir`      __string__  The cube's rotation direction. Can be either 'left' or 'right'.
        this.rotateDir = 'right';

        // * `speed[axis]`    __number__  Determines how fast the cube should rotate 360 degrees. Value is in 'iterations', not milliseconds.
        this.speedX = 0;
        this.speedY = 0;
        this.speedZ = 0;

        // * `pos[axis]`      __number__  The cube's rotation value from **0 to 360**.
        this.posX = 0;
        this.posY = 0;
        this.posZ = 0;

        // * `snapshot[axis]` __number__  The cube's rotation value from **0 to 360**. Used to 'remember' last values. See 'focusOn' method. 
        this.snapshotX = 0;
        this.snapshotY = 0;
        this.snapshotZ = 0;

        // * `isRotating`     __boolean__ True if cube is being rotated at the moment (rotate method is in use). See `rotate`.
        this.isRotating = false;

        // * `isFocusing`     __boolean__ True if cube is being focused at the moment (rotates to show selected side). See `rotate`, `spinTo`, and `focusOn` methods.
        this.isFocusing = false;

        // * `hasFocused`     __boolean__ True if cube has rotated to the selected side. See `focusOn` method.
        this.hasFocused = false;

        // * `iterators`     __object__   Stores iterators for each axis. See `spinTo` method.
        this.iterators = {};

        // * `timers`        __object__   Stores timers (requestAnimationFrame).
        this.timers = {};
    };

    Cube.instance.prototype = {
        // * `xyz` and `XYZ` __array__    'x', 'y', 'z' prefixes.
        xyz: ['x', 'y', 'z'],
        XYZ: ['X', 'Y', 'Z'],

        // * `sides`         __object__   Predefined cube's sides coordinates.
        sides: {
            'side-1': [0, 90, 0],
            'side-2': [90, 0, 0],
            'side-3': [0, 0, 0],
            'side-4': [270, 0, 0],
            'side-5': [0, 270, 0],
            'side-6': [0, 180, 0]
        },

        // ### Public Methods

        // #### Apply rotation
        // Set rotation of the cube.
        // 
        // * parameters: `props` __object__ Rotation of each axis in the following format:
        //   ```
        //   {
        //      x: [number from 0 to 360],
        //      y: [number from 0 to 360],
        //      z: [number from 0 to 360]
        //   }
        //   ```
        //   or predefined side string:
        //   
        //   ```
        //   { side: 'side-3' }
        //   ```
        //   
        // Usage examples:
        // ```
        // var myCube = Cube('.my .selector');
        // 
        // // Set the cube's position
        // myCube.applyRotation({
        //     x: 45,
        //     y: 30,
        //     z: 270
        // });
        // ```
        // 
        // ```
        // var myCube = Cube('.my .selector');
        // 
        // // Set the cube's position
        // myCube.applyRotation({ side: 'side-4' });
        // ```
        applyRotation: function (props) {
            var prefix = this._getPrefix(),
                styles = 'perspective(' + this.props.perspective + 'px)',
                currentDeg,
                axes = 0;

            props = props || {};

            if (props.x && props.y && props.z) {
                while (axes < 3) {
                    currentDeg = props[this.xyz[axes]];
                    currentDeg = isNaN(currentDeg) ? 0 : currentDeg;

                    this['pos' + this.XYZ[axes]] = currentDeg;

                    axes += 1;
                }
            } else if (props.side) {
                if (!this.sides[props.side]) { throw 'You\'ve probably entered wrong string as a "side" in "applyRotation". Try "side-1", "side-2", "side-3", "side-4", "side-5", or "side-6"'; }

                while (axes < 3) {
                    currentDeg = this.sides[props.side][axes];

                    this['pos' + this.XYZ[axes]] = currentDeg;

                    axes += 1;
                }
            }

            axes = 0;
            while (axes < 3) {
                currentDeg = this['pos' + this.XYZ[axes]];

                styles += ' rotate' + this.XYZ[axes] + '(' + currentDeg + 'deg)';

                axes += 1;
            }

            this.$cube.style[prefix ? prefix + 'Transform' : 'transform'] = styles;
        },

        // #### Rotate
        // Start infinite rotation animation.
        // 
        // * parameters: `props` __object__ Rotate options:
        //     - `startSide`   __string__ Specify from which side should the cube start to animate.
        //       Possible options:
        //         - side-1, side-2, side-3, side-4, side-5, side-6
        //         
        //     - `speed[axis]` __number__ Time in milliseconds in which the cube rotate around one axis (from 0 to 360 degrees).
        //     - `rotateDir` __string__ Can be 'left' or 'right'.
        //     
        // Usage example:
        // ```
        // var myCube = Cube('.my .selector');
        // 
        // // Cube will start rotating
        // myCube.rotate({
        //     startSide: 'side-1',
        //     speedX: 5000,  // 5 seconds
        //     speedY: 20000, // 20 seconds
        //     speedZ: 10000  // 10 seconds
        //     rotateDir: 'left'
        // });
        // ```
        rotate: function (props) {
            var i = 0,
                dir = 0,
                XYZ = this.XYZ,
                self = this,
                currentSpeed;

            props = props || {};

            self.rotateDir = props.rotateDir || self.rotateDir;

            self.isRotating = true;

            if (props.startSide && self.sides[props.startSide] === undefined) { throw 'You\'ve typed wrong value for "startSide" option.'; }

            self.isFocusing = false;

            if (!self.rotatePropsSet) {
                while (i < 3) {
                    if (props.startSide) {
                        props['start' + XYZ[i]] = self.sides[props.startSide][i];
                    }

                    self['pos' + XYZ[i]] = props['start' + XYZ[i]] || 0;

                    currentSpeed = props['speed' + XYZ[i]];
                    currentSpeed = currentSpeed === 0 ? 0 : (currentSpeed || 360);
                    self['speed' + XYZ[i]] = currentSpeed;
                    i += 1;
                }

                self.rotateDir = props.rotateDir || self.rotateDir;

                self.rotatePropsSet = true;
            }

            if (self.rotateDir === 'left') { dir = -360; }
            if (self.rotateDir === 'right') { dir = 360; }

            self._spinTo({
                spinToX: props.startX ? props.startX + dir : dir,
                spinToY: props.startY ? props.startY + dir : dir,
                spinToZ: props.startZ ? props.startZ + dir : dir,
                speedX: self.speedX,
                speedY: self.speedY,
                speedZ: self.speedZ,
                timer: 'rotate',
                repeat: true,
                easing: 'linear'
            });
        },

        // #### Focus On
        // Animate to the specified side of the cube on 'mouseover' or 'touchstart' event.
        // 
        // * parameters: `props` __object__ focusOn options:
        //     - `bounceBack`   __boolean__ If set to true the cube will animate back to its last position (before focusOn animation), else it will stay at the focused position.
        //     - `spinTo`       __string__  Specify to which side should the cube animate to. **Note** that this option will overwrite `spintTo[axis]`.
        //     - `spinTo[axis]` __number__  Specify to what degree each axis should animate to.
        //     
        // Usage example:
        // ```
        // var myCube = Cube('.my .selector');
        // 
        // // Cube will rotate to selected face
        // // either on 'touchstart' or 'mouseover' event.
        // myCube.focusOn({
        //     bounceBack: true,
        //     spinTo: 'side-6'
        // });
        // ```
        focusOn: function (props) {
            var self = this,
                isTouch = window.ontouchstart === null,
                startEvent = isTouch ? 'touchstart' : 'mouseover';

            props = props || {};

            function focus() {
                if (props.bounceBack) {
                    cancelAnimationFrame(self.timers.deFocus);
                }

                if (!self.isFocusing) {
                    self.snapshotX = self.posX;
                    self.snapshotY = self.posY;
                    self.snapshotZ = self.posZ;
                }

                if (props.spinTo && self.sides[props.spinTo] === undefined) { throw 'You\'ve typed wrong value for "spinTo" option.'; }

                if (props.spinTo && self.sides[props.spinTo] !== undefined) {
                    props.spinToX = self.sides[props.spinTo][0];
                    props.spinToY = self.sides[props.spinTo][1];
                    props.spinToZ = self.sides[props.spinTo][2];
                }

                self._spinTo({
                    spinToX: props.spinToX || 0,
                    spinToY: props.spinToY || 0,
                    spinToZ: props.spinToZ || 0,
                    speed: props.speed || 2000,
                    timer: 'spinTo',
                    easing: 'out',
                    callback: function () {
                        self.$cube.className += ' focused';
                        self.hasFocused = true;
                    }
                });
            }

            function deFocus() {
                cancelAnimationFrame(self.timers.spinTo);
                cancelAnimationFrame(self.timers.rotate);

                self._removeClass(self.$cube, 'focused');
                self.hasFocused = false;

                if (props.bounceBack) {
                    self._spinTo({
                        spinToX: self.snapshotX,
                        spinToY: self.snapshotY,
                        spinToZ: self.snapshotZ,
                        speed: props.speed || 2000,
                        timer: 'deFocus',
                        easing: 'out',
                        callback: function () {
                            if (self.isRotating) {
                                self.rotate({
                                    startX: self.posX,
                                    startY: self.posY,
                                    startZ: self.posZ
                                });
                            }
                        }
                    });
                } else if (self.isRotating) {
                    self.rotate({
                        startX: self.posX,
                        startY: self.posY,
                        startZ: self.posZ
                    });
                }
            }

            self.$cube.addEventListener(startEvent, function (e) {
                if (self.hasFocused) { return; }
                e.preventDefault();
                cancelAnimationFrame(self.timers.rotate);
                focus();
            });

            self.$cube.addEventListener('mouseout', deFocus);

            if (isTouch) {
                document.addEventListener('touchstart', function (e) {
                    var $target = e.target;
                    if (!self._hasParent($target, self.$cube)) { deFocus(); }
                });
            }
        },

        // ### Private Methods

        // #### Spin To
        // Animate to the specified position.
        // 
        // * parameters: `props` __object__ spinTo options:
        //     - `spinTo[axis]` __number__   Specify to what degree each axis should animate to.
        //     - `speed`        __number__   Time (in milliseconds) that specifies how long it will take to spin to given position. Overwrites `speed[axis]`.
        //     - `speed[axis]`  __number__   Time (in milliseconds) that specifies how long it will take to spin to given position for each axis.
        //     - `timer`        __string__   Timer's ID. It can be reset if needed thus stopping spinTo loop. Timers are attached to public variable called `timers` (see in constructor).
        //     - `easing`       __string__   Name of easing function (available functions: 'ease', 'out', 'inOut')
        //     - `callback`     __function__ Function which executes after spinTo is done.
        _spinTo: function (props) {
            var i = 0,
                self = this,
                start = {},
                speeds = [],
                changeInValue = {},
                changeInValueA = {},
                changeInValueB = {},
                dir = {},
                done = {},
                xyz = self.xyz,
                XYZ = self.XYZ,
                currentMax,
                currentDeg,
                currentSpeed,
                currentIterator;

            props.speed = self._calculateIterations(props.speed);

            self.isFocusing = props.repeat ? false : true;

            while (i < 3) {
                start[xyz[i]] = self['pos' + XYZ[i]];

                if (props['speed' + XYZ[i]]) {
                    props['speed' + XYZ[i]] = self._calculateIterations(props['speed' + XYZ[i]]);
                }

                if (props.repeat) {
                    changeInValue[xyz[i]] = Math.abs(start[xyz[i]] - props['spinTo' + XYZ[i]]);
                } else {
                    changeInValueA[xyz[i]] = Math.abs(start[xyz[i]] - props['spinTo' + XYZ[i]]);
                    if (start[xyz[i]] > props['spinTo' + XYZ[i]]) {
                        changeInValueB[xyz[i]] = Math.abs(start[xyz[i]] - props['spinTo' + XYZ[i]] - 360);
                    } else {
                        changeInValueB[xyz[i]] = Math.abs(start[xyz[i]] - props['spinTo' + XYZ[i]] + 360);
                    }

                    if (changeInValueA[xyz[i]] < changeInValueB[xyz[i]]) {
                        changeInValue[xyz[i]] = changeInValueA[xyz[i]];
                    } else {
                        if (start[xyz[i]] > props['spinTo' + XYZ[i]]) {
                            props['spinTo' + XYZ[i]] += 360;
                        } else {
                            props['spinTo' + XYZ[i]] -= 360;
                        }

                        changeInValue[xyz[i]] = changeInValueB[xyz[i]];
                    }
                }

                dir[xyz[i]] = start[xyz[i]] < props['spinTo' + XYZ[i]] ? 'right' : 'left';
                speeds.push(props.speed ? Math.floor(Math.abs(start[xyz[i]] - props['spinTo' + XYZ[i]]) * props.speed / 360) : props['speed' + XYZ[i]]);

                i += 1;
            }

            speeds.sort(function (a, b) { return b - a; });
            this.iterators.spinTo = { x: 0, y: 0, z: 0 };
            props.easing = props.easing || 'linear';

            function run() {
                i = 0;

                while (i < 3) {
                    currentMax = changeInValue[xyz[i]];
                    currentSpeed = props.speed ? speeds[0] : props['speed' + XYZ[i]];

                    if (currentMax !== 0 && currentSpeed !== 0) {
                        currentDeg = self['pos' + XYZ[i]];
                        currentIterator = self.iterators.spinTo[xyz[i]];

                        currentDeg = currentSpeed === 0 ? 0 : self._ease[props.easing](currentIterator, 0, currentMax, currentSpeed);

                        if (dir[xyz[i]] === 'right') {
                            currentDeg += start[xyz[i]];
                            currentMax += start[xyz[i]];

                            if (currentDeg < currentMax) {
                                currentIterator += 1;
                            } else {
                                currentDeg = currentMax;
                                done[xyz[i]] = true;
                            }
                        } else {
                            currentDeg = start[xyz[i]] - currentDeg;
                            currentMax = start[xyz[i]] - currentMax;

                            if (currentDeg > currentMax) {
                                currentIterator += 1;
                            } else {
                                currentDeg = currentMax;
                                done[xyz[i]] = true;
                            }
                        }

                        self['pos' + XYZ[i]] = currentDeg;
                        self.iterators.spinTo[xyz[i]] = currentIterator;
                    } else {
                        done[xyz[i]] = true;
                    }

                    i += 1;
                }

                self.applyRotation();

                i = 0;

                while (i < 3) {
                    if (done[xyz[i]] && props.repeat) {
                        self['pos' + XYZ[i]] = start[xyz[i]];
                        self.iterators.spinTo[xyz[i]] = 0;
                        done[xyz[i]] = false;
                    }

                    i += 1;
                }

                if (done.x && done.y && done.z && !props.repeat) {
                    self.isFocusing = false;
                    if (props.callback) { props.callback(); }
                    return;
                }

                self.timers[props.timer] = requestAnimationFrame(run);
            }

            run();
        },

        // #### Easing functions
        _ease: {
            // ##### Linear
            //  * `parameters` (apply for all easing functions below):
            //      - `currentIteration` __number__  Current iteration.
            //      - `startValue`       __number__  Start value. For example: '10'.
            //      - `changeInValue`    __number__  Change in value. For example '40' means that if value started at 10, it would go up to 50.
            //      - `totalIterations`  __number__  Tells how many iterations should pass until the animation is done.
            linear: function (currentIteration, startValue, changeInValue, totalIterations) {
                return changeInValue * currentIteration / totalIterations + startValue;
            },

            // ##### Out
            out: function (currentIteration, startValue, changeInValue, totalIterations) { // outCirc
                currentIteration = currentIteration / totalIterations - 1;
                return changeInValue * Math.sqrt(1 - Math.pow(currentIteration, 2)) + startValue;
            },

            // ##### In Out
            inOut: function (currentIteration, startValue, changeInValue, totalIterations) { // inOutCirc
                return changeInValue / 2 * (1 - Math.cos(Math.PI * currentIteration / totalIterations)) + startValue;
            }
        },

        // #### Calculate Iterations
        // Calculates approximate number of iterations.
        // Converts milliseconds into number of animation frames for the cube.
        // It's assumed here that `requestAnimationFrame` will produce 60 frames per second.
        // 
        // * parameters: `milliseconds` __number__ Time in milliseconds.
        // * return:                    __number__ Returns number of iterations.
        _calculateIterations: function (milliseconds) {
            return milliseconds * 60 / 1000;
        },

        // #### Get Prefix
        // Check if a browser prefix is necessary and, if it is, choose the right one.
        // Test is based on `transform` property which necessary for the script to work.
        // 
        // * return: __Numeric__ Returns number of iterations.
        _getPrefix: function () {
            var style = document.documentElement.style,
                prefix;
            if (style.webkitTransform !== undefined) { prefix = 'webkit'; }
            if (style.mozTransform !== undefined) { prefix = 'moz'; }
            if (style.msTransform !== undefined) { prefix = 'ms'; }
            return prefix;
        },

        // #### Has Parent
        // Check if one element (`$parentEl`) is parent of the second one (`$el`)
        // 
        // * parameters:
        //     - `$el`       __object__  DOM element (assumed children).
        //     - `$parentEl` __object__  DOM element (assumed parent).
        // * return:         __boolean__ Returns true if `$parentEl` is `$el` parent.
        _hasParent: function ($el, $parentEl) {
            var $parentNode = $el.parentNode;

            while ($parentNode !== $parentEl && $parentNode !== document) {
                $parentNode = $parentNode.parentNode;
            }

            return $parentNode === $parentEl ? true : false;
        },

        // #### Remove Class
        // Remove CSS class from an element.
        // 
        // * parameters:
        //     - `$el`       __object__  DOM element
        //     - `className` __string__  class' name, example: *'my-class'*
        _removeClass: function ($el, className) {
            var regex = new RegExp('\\b' + className + '\\b', 'g');
            $el.className = $el.className.replace(regex, '');
        }
    };
}());