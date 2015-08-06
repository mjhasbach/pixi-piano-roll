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
            for (var _iterator = opt.noteData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var _step$value = _slicedToArray(_step.value, 3);

                var transportTime = _step$value[0];
                var note = _step$value[1];
                var duration = _step$value[2];

                var pixiNote = new pixi.Graphics(),
                    x = transportTimeToX(transportTime) + halfGridLineWidth,
                    y = opt.height - (teoria.note(note).key() - noteRange.min) * noteHeight + halfGridLineWidth,
                    width = barWidth / parseInt(duration);

                noteContainer.addChild(pixiNote);

                pixiNote.beginFill(opt.noteColor).drawRect(x, y, width, innerNoteHeight).endFill();
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
return pixiPianoRoll;
}));
