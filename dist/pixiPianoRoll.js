;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['pixi.js', 'teoria'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('pixi.js'), require('teoria'));
  } else {
    root.pixiPianoRoll = factory(root.PIXI, root.teoria);
  }
}(this, function(pixi, teoria) {
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function pixiPianoRoll(opt) {
    opt = Object.assign({
        width: 900,
        height: 400,
        noteColor: 0xFF0900,
        gridLineColor: 0x0004FF,
        backgroundColor: 0xF1F1F1,
        bpm: 140,
        antialias: true,
        zoom: 4,
        resolution: 2,
        time: '0:0:0',
        renderer: 'WebGLRenderer',
        noteData: []
    }, opt);

    var lastTime = undefined,
        playing = false,
        renderer = new pixi[opt.renderer](opt.width, opt.height, { antialias: opt.antialias }),
        stage = new pixi.Container(),
        noteContainer = new pixi.Container(),
        noteRange = getNoteRange(opt.noteData),
        noteRangeDiff = noteRange.max - noteRange.min,
        barWidth = opt.width / opt.zoom,
        beatWidth = opt.width / (opt.zoom * 4),
        sixteenthWidth = beatWidth / 4,
        beatsPerMs = opt.bpm / 60 / 1000,
        pxMovementPerMs = beatWidth * beatsPerMs,
        gridLineWidth = barWidth / 100,
        halfGridLineWidth = gridLineWidth / 2,
        gridLineSpacing = barWidth / opt.resolution,
        noteHeight = opt.height / noteRangeDiff,
        innerNoteHeight = noteHeight - gridLineWidth,
        noteGrid = { horizontal: [], vertical: [] };

    function getNoteRange() {
        var min, max;

        opt.noteData.forEach(function (noteData) {
            var keyNumber = teoria.note(noteData[1]).key();

            if (keyNumber < min || typeof min !== 'number') {
                min = keyNumber;
            }
            if (keyNumber > max || typeof max !== 'number') {
                max = keyNumber;
            }
        });

        return { min: min - 1, max: max };
    }

    function drawBackground() {
        stage.addChild(new pixi.Graphics().clear().beginFill(opt.backgroundColor).drawRect(0, 0, opt.width, opt.height).endFill());
    }

    function transportTimeToX(transportTime) {
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
                    teoriaNote = teoria.note(note),
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

        stage.addChild(noteContainer);
        noteContainer.x = -transportTimeToX(opt.time);
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

            stage.addChild(line);
        }

        for (i = 0; i < opt.zoom * opt.resolution + 1; i++) {
            var line = new pixi.Graphics();

            noteGrid.vertical.push({
                x: i * gridLineSpacing - halfGridLineWidth,
                y: 0,
                graphic: line
            });

            stage.addChild(line);
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

    drawBackground();
    initGridlines();
    drawGridlines();
    drawNotes();

    renderer.render(stage);

    return Object.defineProperties({
        play: function play() {
            playing = true;
            requestAnimationFrame(animate);
        },
        pause: function pause() {
            playing = false;
        }
    }, {
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
}

// http://rhythmiclight.com/archives/ideas/colorscales.html
pixiPianoRoll.colorscales = {
    louisBertrandCastel: {
        'C': 0x1C0D82, // blue
        'C#': 0x1B9081, // blue-green
        'D': 0x149033, // green
        'D#': 0x709226, // olive green
        'E': 0xF5F43C, // yellow
        'F': 0xF5D23B, // yellow-orange
        'F#': 0xF88010, // orange
        'G': 0xFA0B0C, // red
        'G#': 0xA00C09, // crimson
        'A': 0xD71386, // violet
        'A#': 0x4B0E7D, // agate
        'B': 0x7F087C // indigo
    },
    dDJameson: {
        'C': 0xFA0B0C, // red
        'C#': 0xF44712, // red-orange
        'D': 0xF88010, // orange
        'D#': 0xF5D23B, // orange-yellow
        'E': 0xF5F43C, // yellow
        'F': 0x149033, // green
        'F#': 0x1B9081, // green-blue
        'G': 0x1C0D82, // blue
        'G#': 0x4B0E7D, // blue-purple
        'A': 0x7F087C, // purple
        'A#': 0xA61586, // purple-violet
        'B': 0xD71285 // violet
    },
    theodorSeemann: {
        'C': 0x6A1C1C, // carmine
        'C#': 0xFA0B0C, // scarlet
        'D': 0xFF7D05, // orange
        'D#': 0xFCD533, // yellow-orange
        'E': 0xF5F43C, // yellow
        'F': 0x169034, // green
        'F#': 0x1B9081, // green blue
        'G': 0x1C0D82, // blue
        'G#': 0x7F087C, // indigo
        'A': 0xD71386, // violet
        'A#': 0x6A1C1C, // brown
        'B': 0x070707 // black
    },
    aWallaceRimington: {
        'C': 0xFA0B0C, // deep red
        'C#': 0xA00C09, // crimson
        'D': 0xF44712, // orange-crimson
        'D#': 0xF88010, // orange
        'E': 0xF5F43C, // yellow
        'F': 0x709226, // yellow-green
        'F#': 0x149033, // green
        'G': 0x26A680, // blueish green
        'G#': 0x1B9081, // blue-green
        'A': 0x7F087C, // indigo
        'A#': 0x1C0D82, // deep blue
        'B': 0xD71386 // violet
    },
    hHelmholtz: {
        'C': 0xF5F43C, // yellow
        'C#': 0x149033, // green
        'D': 0x1B9081, // greenish blue
        'D#': 0x1C5BA0, // cayan-blue
        'E': 0x7F087C, // indigo blue
        'F': 0xD71386, // violet
        'F#': 0x9D0E55, // end of red
        'G': 0xFA0B0C, // red
        'G#': 0xD32C0A, // red
        'A': 0xD32C0A, // red
        'A#': 0xD91951, // red orange
        'B': 0xF17A0F // orange
    },
    aScriabin: {
        'C': 0xFA0B0C, // red
        'C#': 0xD71386, // violet
        'D': 0xF5F43C, // yellow
        'D#': 0x5A5685, // steely with the glint of metal
        'E': 0x1C5BA0, // pearly blue the shimmer of moonshine
        'F': 0xA00C09, // dark red
        'F#': 0x1C0D82, // bright blue
        'G': 0xF88010, // rosy orange
        'G#': 0x7F0A7C, // purple
        'A': 0x149033, // green
        'A#': 0x5A5685, // steely with a glint of metal
        'B': 0x1C5BA0 // pearly blue the shimmer of moonshine
    },
    aBernardKlein: {
        'C': 0xC40A09, // dark red
        'C#': 0xFA0B0C, // red
        'D': 0xF44712, // red orange
        'D#': 0xF88010, // orange
        'E': 0xF5F43C, // yellow
        'F': 0xBCE039, // yellow green
        'F#': 0x149033, // green
        'G': 0x1B9081, // blue-green
        'G#': 0x1C0D82, // blue
        'A': 0x781887, // blue violet
        'A#': 0xD71386, // violet
        'B': 0x9D0E55 // dark violet
    },
    iJBelmont: {
        'C': 0xFA0B0C, // red
        'C#': 0xF44712, // red-orange
        'D': 0xF88010, // orange
        'D#': 0xF6D111, // yellow-orange
        'E': 0xF5F43C, // yellow
        'F': 0xBCE039, // yellow-green
        'F#': 0x138F32, // green
        'G': 0x1B9081, // blue-green
        'G#': 0x1C0D82, // blue
        'A': 0xA51585, // blue-violet
        'A#': 0xD71386, // violet
        'B': 0xAD0E48 // red-violet
    },
    sZieverink: {
        'C': 0xBCE039, // yellow/green
        'C#': 0x149033, // green
        'D': 0x1B9081, // blue/green
        'D#': 0x1C0D82, // blue
        'E': 0x7F087C, // indigo
        'F': 0xD71386, // violet
        'F#': 0x6F0D45, // ultra violet
        'G': 0xA00C09, // infra red
        'G#': 0xFA0B0C, // red
        'A': 0xF88010, // orange
        'A#': 0xEDF087, // yellow/white
        'B': 0xF5F43C // yellow
    }
};
return pixiPianoRoll;
}));
