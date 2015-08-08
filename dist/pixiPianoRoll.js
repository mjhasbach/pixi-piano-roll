;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['pixi.js', 'teoria', 'musical-scale-colors'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('pixi.js'), require('teoria'), require('musical-scale-colors'));
  } else {
    root.pixiPianoRoll = factory(root.PIXI, root.teoria, root.musicalScaleColors);
  }
}(this, function(pixi, teoria, musicalScaleColors) {
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function pixiPianoRoll(opt) {
    var colors = {
        black: 0,
        white: 0xFFFFFF
    };

    opt = Object.assign({
        width: 900,
        height: 400,
        noteColor: musicalScaleColors.dDJameson,
        gridLineColor: 0x333333,
        backgroundColor: colors.black,
        bpm: 140,
        antialias: true,
        zoom: 4,
        resolution: 2,
        time: '0:0:0',
        renderer: 'WebGLRenderer',
        noteFormat: 'String',
        noteData: []
    }, opt);

    var lastTime = undefined,
        beatsPerMs = undefined,
        pxMovementPerMs = undefined,
        playing = false,
        renderer = new pixi[opt.renderer](opt.width, opt.height, { antialias: opt.antialias }),
        stage = new pixi.Container(),
        noteContainer = new pixi.Container(),
        pianoContainer = new pixi.Container(),
        rollContainer = new pixi.Container(),
        rollContainerScale = 0.89,
        noteRange = getNoteRange(opt.noteData),
        noteRangeDiff = noteRange.max - noteRange.min,
        barWidth = opt.width / opt.zoom,
        beatWidth = opt.width / (opt.zoom * 4),
        sixteenthWidth = beatWidth / 4,
        gridLineWidth = barWidth / 100,
        halfGridLineWidth = gridLineWidth / 2,
        gridLineSpacing = barWidth / opt.resolution,
        noteHeight = opt.height / noteRangeDiff,
        innerNoteHeight = noteHeight - gridLineWidth,
        noteGrid = { horizontal: [], vertical: [] };

    function setBPM(bpm) {
        beatsPerMs = bpm / 60 / 1000;
        pxMovementPerMs = beatWidth * beatsPerMs;
    }

    function getTeoriaNote(note) {
        var noteObj = teoria.note['from' + opt.noteFormat](note);

        return opt.noteFormat === 'Frequency' ? noteObj.note : noteObj;
    }

    function getNoteRange() {
        var min = undefined,
            max = undefined;

        opt.noteData.forEach(function (noteData) {
            var keyNumber = getTeoriaNote(noteData[1]).key();

            if (keyNumber < min || typeof min !== 'number') {
                min = keyNumber;
            }
            if (keyNumber > max || typeof max !== 'number') {
                max = keyNumber;
            }
        });

        return { min: min - 1, max: max };
    }

    function drawPianoKeys() {
        var whiteKeys = [],
            blackKeys = [],
            whiteKeyWidth = barWidth / 2 * rollContainerScale,
            blackKeyWidth = whiteKeyWidth / 1.575;

        for (var i = noteRange.min; i < noteRange.max + 2; i++) {
            var y = opt.height + (noteRange.min - i) * noteHeight,
                note = teoria.note.fromKey(i),
                chroma = note.chroma();

            if (new Set([0, 2, 4, 5, 7, 9, 11]).has(chroma)) {
                whiteKeys.push({
                    y: y + (new Set([4, 11]).has(chroma) ? 0 : -noteHeight / 2),
                    width: whiteKeyWidth,
                    height: new Set([2, 7, 9]).has(chroma) ? noteHeight * 2 : noteHeight * 1.5,
                    color: colors.white
                });
            } else {
                blackKeys.push({
                    y: y,
                    width: blackKeyWidth,
                    height: noteHeight,
                    color: colors.black
                });
            }
        }

        whiteKeys.concat(blackKeys).forEach(function (key) {
            pianoContainer.addChild(new pixi.Graphics().beginFill(key.color).lineStyle(key.color === colors.white ? gridLineWidth : 0, colors.black).drawRect(0, key.y, key.width, key.height).endFill());
        });

        stage.addChild(pianoContainer);
    }

    function drawBackground() {
        rollContainer.addChild(new pixi.Graphics().beginFill(opt.backgroundColor).drawRect(0, 0, opt.width, opt.height).endFill());
    }

    function transportTimeToX(transportTime) {
        if (!transportTime) {
            return 0;
        }

        var _transportTime$split = transportTime.split(':');

        var _transportTime$split2 = _slicedToArray(_transportTime$split, 3);

        var bar = _transportTime$split2[0];
        var _transportTime$split2$1 = _transportTime$split2[1];
        var quarter = _transportTime$split2$1 === undefined ? 0 : _transportTime$split2$1;
        var _transportTime$split2$2 = _transportTime$split2[2];
        var sixteenth = _transportTime$split2$2 === undefined ? 0 : _transportTime$split2$2;

        return barWidth * bar + beatWidth * quarter + sixteenthWidth * sixteenth;
    }

    function drawNotes() {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            var _loop = function () {
                var _step$value = _slicedToArray(_step.value, 3);

                var transportTime = _step$value[0];
                var note = _step$value[1];
                var duration = _step$value[2];

                var color = opt.noteColor,
                    pixiNote = new pixi.Graphics(),
                    teoriaNote = getTeoriaNote(note),
                    x = transportTimeToX(transportTime) + halfGridLineWidth,
                    y = opt.height - (teoriaNote.key() - noteRange.min) * noteHeight + halfGridLineWidth,
                    width = barWidth / parseInt(duration);

                if (typeof color === 'object') {
                    Object.keys(color).forEach(function (key) {
                        if (teoria.note(key).chroma() === teoriaNote.chroma()) {
                            color = color[key];
                        }
                    });
                }

                noteContainer.addChild(pixiNote);

                pixiNote.beginFill(color).drawRect(x, y, width, innerNoteHeight).endFill();
            };

            for (var _iterator = opt.noteData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator['return']) {
                    _iterator['return']();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        noteContainer.x = -transportTimeToX(opt.time);
        rollContainer.addChild(noteContainer);
        rollContainer.width = rollContainer.width * rollContainerScale;
        rollContainer.x = opt.width * (1 - rollContainerScale);
        stage.addChild(rollContainer);
    }

    function drawGridlines(type) {
        if (typeof type !== 'string') {
            drawGridlines('horizontal');
            drawGridlines('vertical');
            return;
        }

        var width = type === 'vertical' ? gridLineWidth : opt.width,
            height = type === 'vertical' ? opt.height : gridLineWidth;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = noteGrid[type][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var line = _step2.value;

                line.graphic.clear().beginFill(opt.gridLineColor).drawRect(line.x, line.y, width, height).endFill();
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                    _iterator2['return']();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }

    function moveVerticalGridLines(horizontalMovement) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = noteGrid.vertical[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var line = _step3.value;

                line.x = line.x - horizontalMovement;
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                    _iterator3['return']();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        if (noteGrid.vertical[0].x + gridLineWidth < 0) {
            var line = noteGrid.vertical.shift();

            line.x = noteGrid.vertical[noteGrid.vertical.length - 1].x + gridLineSpacing;

            noteGrid.vertical.push(line);
        }
    }

    function initGridlines() {
        var i = undefined;

        for (i = 0; i < noteRangeDiff + 1; i++) {
            var line = new pixi.Graphics();

            noteGrid.horizontal.push({
                x: 0,
                y: i * noteHeight - halfGridLineWidth,
                graphic: line
            });

            rollContainer.addChild(line);
        }

        for (i = 0; i < opt.zoom * opt.resolution + 1; i++) {
            var line = new pixi.Graphics();

            var _opt$time$split = opt.time.split(':');

            var _opt$time$split2 = _slicedToArray(_opt$time$split, 3);

            var bar = _opt$time$split2[0];
            var _opt$time$split2$1 = _opt$time$split2[1];
            var quarter = _opt$time$split2$1 === undefined ? 0 : _opt$time$split2$1;
            var _opt$time$split2$2 = _opt$time$split2[2];
            var sixteenth = _opt$time$split2$2 === undefined ? 0 : _opt$time$split2$2;
            var offset = quarter * beatWidth + sixteenth * sixteenthWidth;

            noteGrid.vertical.push({
                x: i * gridLineSpacing - halfGridLineWidth - offset,
                y: 0,
                graphic: line
            });

            rollContainer.addChild(line);
        }
    }

    function animate(frameTime) {
        if (!lastTime) {
            lastTime = frameTime;
        }

        var timeDiff = frameTime - lastTime,
            horizontalMovement = timeDiff * pxMovementPerMs;

        noteContainer.x = noteContainer.x - horizontalMovement;

        moveVerticalGridLines(horizontalMovement);
        drawGridlines('vertical');

        lastTime = frameTime;

        renderer.render(stage);

        playing ? requestAnimationFrame(animate) : lastTime = null;
    }

    setBPM(opt.bpm);
    drawBackground();
    initGridlines();
    drawGridlines();
    drawNotes();
    drawPianoKeys();

    renderer.render(stage);

    var pianoRoll = Object.defineProperties({
        playback: {
            toggle: function toggle(time) {
                playing ? pianoRoll.playback.pause() : pianoRoll.playback.play(time);
            },
            play: function play(time) {
                var xTime = -transportTimeToX(time);

                if (xTime) {
                    moveVerticalGridLines(noteContainer.x - xTime);
                    noteContainer.x = xTime;
                }

                playing = true;

                requestAnimationFrame(animate);
            },
            pause: function pause() {
                playing = false;
            }
        }
    }, {
        bpm: {
            set: function set(bpm) {
                setBPM(bpm);
            },
            configurable: true,
            enumerable: true
        },
        playing: {
            get: function get() {
                return playing;
            },
            configurable: true,
            enumerable: true
        },
        view: {
            get: function get() {
                return renderer.view;
            },
            configurable: true,
            enumerable: true
        }
    });

    return pianoRoll;
}
return pixiPianoRoll;
}));
