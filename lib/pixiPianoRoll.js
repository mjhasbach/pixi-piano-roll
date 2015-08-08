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
        var min, max;

        opt.noteData.forEach(function(noteData) {
            var keyNumber = getTeoriaNote(noteData[1]).key();

            if (keyNumber < min || typeof min !== 'number') {
                min = keyNumber;
            }
            if (keyNumber > max || typeof max !== 'number') {
                max = keyNumber;
            }
        });

        return {min: min - 1, max: max};
    }

    function drawPianoKeys() {
        let whiteKeys = [],
            blackKeys = [],
            whiteKeyWidth = (barWidth / 2) * rollContainerScale,
            blackKeyWidth = whiteKeyWidth / 1.575;

        for (let i = noteRange.min + 1; i < noteRange.max + 2; i++) {
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
        var [bar, quarter = 0, sixteenth = 0] = transportTime.split(':');

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

    let pianoRoll = {
        playback: {
            toggle() {
                playing ? pianoRoll.playback.pause() : pianoRoll.playback.play();
            },
            play() {
                playing = true;
                requestAnimationFrame(animate);
            },
            pause() {
                playing = false;
            }
        },
        set bpm(bpm) {
            setBPM(bpm);
        },
        get playing() {
            return playing;
        },
        get view() {
            return renderer.view;
        }
    };

    return pianoRoll;
}