/**
 * JavaScript 2D WebGL / Canvas animated piano roll
 * @module pixiPianoRoll
 * @author Matthew Hasbach
 * @copyright Matthew Hasbach 2015
 * @license MIT
 */

/**
 * Playback position expressed in bars:quarters:sixteenths format (e.g. `"1:2:0"`)
 * @typedef {string} transportTime
 * @global
 */

/**
 * Musical note expressed in [Scientific notation]{@link https://en.wikipedia.org/wiki/Scientific_pitch_notation}, [Helmholtz notation]{@link https://en.wikipedia.org/wiki/Helmholtz_pitch_notation}, [piano key number]{@link https://en.wikipedia.org/wiki/Piano_key_frequencies}, [audio frequency]{@link https://en.wikipedia.org/wiki/Audio_frequency} (the closest note will be used), or [MIDI]{@link https://en.wikipedia.org/wiki/MIDI} note number
 * @typedef {string|number} note
 * @global
 */

/**
 * Note duration expressed as a number (e.g. `1` for a whole note) or string (e.g. `"4n"` for a quarter note)
 * @typedef {string|number} noteDuration
 * @global
 */

/**
 * Instantiate a pixiPianoRoll
 * @alias module:pixiPianoRoll
 * @param {Object} opt - Options object
 * @param {number} [opt.width=900] - Width of the piano roll
 * @param {number} [opt.height=400] - Height of the piano roll
 * @param {number|Object<number>} [opt.noteColor=musicalScaleColors.dDJameson] - Hexadecimal color of every note or object that has music note property names and hexadecimal color values. See [musical-scale-colors]{@link https://github.com/mjhasbach/musical-scale-colors} for palettes (including the default).
 * @param {number} [opt.noteColor=0x333333] - Hexadecimal color of the grid lines
 * @param {number} [opt.noteColor=0] - Hexadecimal color of the background
 * @param {number} [opt.bpm=140] - Beats per minute
 * @param {boolean} [opt.antialias=true] - Whether or not the renderer will use antialiasing
 * @param {number} [opt.zoom=4] - Amount of visible measures
 * @param {number} [opt.resolution=2] - Amount of vertical grid lines per measure
 * @param {transportTime} [opt.time=0:0:0] - The [transportTime]{@link transportTime} at which playback will begin
 * @param {string} [opt.renderer=WebGLRenderer] - Determines the renderer type. Must be `"WebGLRenderer"` or `"CanvasRenderer"`.
 * @param {string} [opt.noteFormat=String] - The format of the [notes]{@link note} in `opt.noteData`. `"String"` for scientific or Helmholtz notation, `"Key"` for piano key numbers, `"Frequency"` for audio frequencies, or `"MIDI"` for MIDI note numbers.
 * @param {Array.<Array<transportTime, note, noteDuration>>} [opt.noteData=[]] - See the typedefs for [transportTime]{@link transportTime}, [note]{@link note}, and [noteDuration]{@link noteDuration}
 * @returns {pianoRollAPI}
 * @example
var pianoRoll = pixiPianoRoll({
    width: 900,
    height: 400,
    noteColor: 0xdb000f,
    gridLineColor: 0x333333,
    backgroundColor: 0x1a0002,
    bpm: 140,
    antialias: true,
    zoom: 4,
    resolution: 2,
    time: '0:0:0',
    renderer: 'WebGLRenderer',
    noteFormat: 'String',
    noteData: [
        ['0:0:0', 'C4', '2n'],
        ['0:0:0', 'D4', '2n'],
        ['0:0:0', 'E4', '2n'],
        ['0:2:0', 'B4', '4n'],
        ['0:3:0', 'A#4', '4n']
    ]
});

document.getElementsByTagName('body')[0].appendChild(pianoRoll.view);

pianoRoll.playback.play();
 */
function pixiPianoRoll(opt) {
    const colors = {
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

    let lastTime,
        beatsPerMs,
        pxMovementPerMs,
        playing = false,
        renderer = new pixi[opt.renderer](opt.width, opt.height, {antialias: opt.antialias}),
        stage = new pixi.Container(),
        noteContainer = new pixi.Container(),
        pianoContainer = new pixi.Container(),
        rollContainer = new pixi.Container(),
        rollContainerScale = 0.89,
        noteRange = getNoteRange(opt.noteData),
        noteRangeDiff = noteRange.max - noteRange.min,
        barWidth = opt.width / opt.zoom,
        beatWidth = (opt.width / (opt.zoom * 4)),
        sixteenthWidth = beatWidth / 4,
        gridLineWidth = barWidth / 100,
        halfGridLineWidth = gridLineWidth / 2,
        gridLineSpacing = barWidth / opt.resolution,
        noteHeight = opt.height / noteRangeDiff,
        innerNoteHeight = noteHeight - gridLineWidth,
        noteGrid = {horizontal: [], vertical: []};

    function setBPM(bpm) {
        beatsPerMs = (bpm / 60) / 1000;
        pxMovementPerMs = beatWidth * beatsPerMs;
    }

    function getTeoriaNote(note) {
        let noteObj = teoria.note['from' + opt.noteFormat](note);

        return opt.noteFormat === 'Frequency' ? noteObj.note : noteObj;
    }

    function getNoteRange() {
        let min, max;

        for (let [,note] of opt.noteData) {
            let keyNumber = getTeoriaNote(note).key();

            if (keyNumber < min || typeof min !== 'number') {
                min = keyNumber;
            }
            if (keyNumber > max || typeof max !== 'number') {
                max = keyNumber;
            }
        }

        return {min: min - 1, max: max};
    }

    function drawPianoKeys() {
        let whiteKeys = [],
            blackKeys = [],
            whiteKeyWidth = (barWidth / 2) * rollContainerScale,
            blackKeyWidth = whiteKeyWidth / 1.575;

        for (let i = noteRange.min; i < noteRange.max + 2; i++) {
            let y = opt.height + ((noteRange.min - i) * noteHeight),
                note = teoria.note.fromKey(i),
                chroma = note.chroma();

            if (new Set([0, 2, 4, 5, 7, 9, 11]).has(chroma)) {
                whiteKeys.push({
                    y: y + (new Set([4, 11]).has(chroma) ? 0 : -noteHeight / 2),
                    width: whiteKeyWidth,
                    height: new Set([2, 7, 9]).has(chroma) ? noteHeight * 2 : noteHeight * 1.5,
                    color: colors.white
                });
            }
            else {
                blackKeys.push({
                    y: y,
                    width: blackKeyWidth,
                    height: noteHeight,
                    color: colors.black
                });
            }
        }

        whiteKeys.concat(blackKeys).forEach(function(key) {
            pianoContainer.addChild(
                new pixi.Graphics()
                    .beginFill(key.color)
                    .lineStyle(key.color === colors.white ? gridLineWidth : 0, colors.black)
                    .drawRect(0, key.y, key.width, key.height)
                    .endFill()
            );
        });

        stage.addChild(pianoContainer);
    }

    function drawBackground() {
        rollContainer.addChild(
            new pixi.Graphics()
                .beginFill(opt.backgroundColor)
                .drawRect(0, 0, opt.width, opt.height)
                .endFill()
        );
    }

    function transportTimeToX(transportTime) {
        if (!transportTime) {
            return 0;
        }

        let [bar, quarter = 0, sixteenth = 0] = transportTime.split(':');

        return (barWidth * bar) + (beatWidth * quarter) + (sixteenthWidth * sixteenth);
    }

    function drawNotes() {
        for (let [transportTime, note, duration] of opt.noteData) {
            let color = opt.noteColor,
                pixiNote = new pixi.Graphics(),
                teoriaNote = getTeoriaNote(note),
                x = transportTimeToX(transportTime) + halfGridLineWidth,
                y = opt.height - ((teoriaNote.key() - noteRange.min) * noteHeight) + halfGridLineWidth,
                width = barWidth / parseInt(duration);

            if (typeof color === 'object') {
                Object.keys(color).forEach(function(key) {
                    if (teoria.note(key).chroma() === teoriaNote.chroma()) {
                        color = color[key];
                    }
                });
            }

            noteContainer.addChild(pixiNote);

            pixiNote
                .beginFill(color)
                .drawRect(x, y, width, innerNoteHeight)
                .endFill();
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

        let width = type === 'vertical' ? gridLineWidth : opt.width,
            height = type === 'vertical' ? opt.height : gridLineWidth;

        for (let line of noteGrid[type]) {
            line.graphic
                .clear()
                .beginFill(opt.gridLineColor)
                .drawRect(line.x, line.y, width, height)
                .endFill();
        }
    }

    function moveVerticalGridLines(horizontalMovement) {
        for (let line of noteGrid.vertical) {
            line.x = line.x - horizontalMovement;
        }

        if (noteGrid.vertical[0].x + gridLineWidth < 0) {
            let line = noteGrid.vertical.shift();

            line.x = noteGrid.vertical[noteGrid.vertical.length - 1].x + gridLineSpacing;

            noteGrid.vertical.push(line);
        }
        else if (noteGrid.vertical[noteGrid.vertical.length - 1].x > opt.width) {
            let line = noteGrid.vertical.pop();

            line.x = noteGrid.vertical[0].x - gridLineSpacing;

            noteGrid.vertical.unshift(line);
        }
    }

    function initGridlines() {
        let i;

        for (i = 0; i < noteRangeDiff + 1; i++) {
            let line = new pixi.Graphics();

            noteGrid.horizontal.push({
                x: 0,
                y: (i * noteHeight) - halfGridLineWidth,
                graphic: line
            });

            rollContainer.addChild(line);
        }

        for (i = 0; i < (opt.zoom * opt.resolution) + 1; i++) {
            let line = new pixi.Graphics(),
                [bar, quarter = 0, sixteenth = 0] = opt.time.split(':'),
                offset = (quarter * beatWidth) + (sixteenth * sixteenthWidth);

            noteGrid.vertical.push({
                x: (i * gridLineSpacing) - halfGridLineWidth - offset,
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

        let timeDiff = frameTime - lastTime,
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

    /**
     * The piano roll API
     * @typedef pianoRollAPI
     * @type {Object}
     * @global
     */
    let pianoRollAPI = {
        /**
         * Contains methods that control playback
         * @memberof pianoRollAPI
         * @type {Object}
         */
        playback: {
            /**
             * Pause if playing or play if paused
             * @param {transportTime} [time] - If paused, the position to begin playing. If omitted, playback will begin at the current position.
             */
            toggle(time) {
                playing ? pianoRollAPI.playback.pause() : pianoRollAPI.playback.play(time);
            },
            /**
             * Begin playback
             * @param {transportTime} [time] - The position to begin playing. If omitted, playback will begin at the current position.
             */
            play(time) {
                if (!playing) {
                    if (time) {
                        pianoRollAPI.playback.seek(time);
                    }

                    playing = true;
                    requestAnimationFrame(animate);
                }
            },
            /**
             * Pause playback
             */
            pause() {
                playing = false;
            },
            /**
             * Change the playback position
             * @param {transportTime} time - The new playback position
             */
            seek(time) {
                let xTime = -transportTimeToX(time),
                    xDiff = noteContainer.x - xTime;

                moveVerticalGridLines(xDiff);
                drawGridlines('vertical');
                noteContainer.x = xTime;
                renderer.render(stage);
            }
        },
        /**
         * Change the bpm by changing this property
         * @memberof pianoRollAPI
         * @type {number}
         */
        set bpm(bpm) {
            setBPM(bpm);
        },
        /**
         * Whether or not playback is ongoing
         * @memberof pianoRollAPI
         * @type {boolean}
         * @readonly
         */
        get playing() {
            return playing;
        },
        /**
         * The piano roll canvas element
         * @memberof pianoRollAPI
         * @type {HTMLElement}
         * @readonly
         */
        get view() {
            return renderer.view;
        }
    };

    return pianoRollAPI;
}